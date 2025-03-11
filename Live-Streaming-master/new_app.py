from flask import Flask, Response, render_template, jsonify, request
import cv2
from pyueye import ueye
import numpy as np
from flask_cors import CORS
import os
import base64
from skimage.metrics import structural_similarity as ssim
import time
from pymodbus.client import ModbusSerialClient, ModbusTcpClient
from pymodbus.exceptions import ModbusException
import struct
import serial.tools.list_ports
import time


class CameraError(Exception):
    pass


class ImageProcessingError(Exception):
    pass


class AlignmentError(Exception):
    pass


class SerialError(Exception):
    pass


app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})


@app.errorhandler(CameraError)
def handle_camera_error(error):
    return jsonify({"error": "Camera Error"}), 500


@app.errorhandler(ImageProcessingError)
def handle_image_processing_error(error):
    print(error)
    return jsonify({"error": "Error occured in Image Processing!"}), 422


@app.errorhandler(AlignmentError)
def handle_alignment_error(error):
    return jsonify({"error": "Image Alignment Failed"}), 422


@app.errorhandler(Exception)
def handle_generic_error(error):
    return jsonify({"error": "Internal server error"}), 500


@app.errorhandler(SerialError)
def handle_serial_error(error):
    return jsonify({"error": "Serial Error"}), 500


hCam = ueye.HIDS(0)
sInfo = ueye.SENSORINFO()
cInfo = ueye.CAMINFO()
rectAOI = ueye.IS_RECT()

ret = ueye.is_InitCamera(hCam, None)
if ret != ueye.IS_SUCCESS:
    raise Exception(f"Camera initialization failed with error code: {ret}")

# Get camera information
ueye.is_GetCameraInfo(hCam, cInfo)
ueye.is_GetSensorInfo(hCam, sInfo)

# Set color mode to RGB8
ueye.is_SetColorMode(hCam, ueye.IS_CM_BGR8_PACKED)

max_width = int(sInfo.nMaxWidth)
max_height = int(sInfo.nMaxHeight)
rectAOI.s32X = ueye.int(0)
rectAOI.s32Y = ueye.int(0)
rectAOI.s32Width = ueye.int(max_width)
rectAOI.s32Height = ueye.int(max_height)
ueye.is_AOI(hCam, ueye.IS_AOI_IMAGE_SET_AOI, rectAOI, ueye.sizeof(rectAOI))

camera_width = int(rectAOI.s32Width)
camera_height = int(rectAOI.s32Height)
bitspixel = 24  # for color mode: IS_CM_BGR8_PACKED
mem_ptr = ueye.c_mem_p()
mem_id = ueye.int()

# Allocate memory for the image
ueye.is_AllocImageMem(hCam, camera_width, camera_height, bitspixel, mem_ptr, mem_id)
ueye.is_SetImageMem(hCam, mem_ptr, mem_id)

# Start video capture
ueye.is_CaptureVideo(hCam, ueye.IS_WAIT)

save_directory = "./section_2_clear"
if not os.path.exists(save_directory):
    os.makedirs(save_directory)

DELAY_FRAMES = 0.04
NO_FRAMES = 3


def generate_frames():
    while True:
        # Create the image buffer for capturing frames
        image_buffer = np.zeros((camera_height, camera_width, 3), dtype=np.uint8)

        # Capture an image frame
        ueye.is_FreezeVideo(hCam, ueye.IS_WAIT)

        # Copy image data to the buffer
        ueye.is_CopyImageMem(hCam, mem_ptr, mem_id, image_buffer.ctypes.data)
        # Encode image to JPEG format
        ret, buffer = cv2.imencode(".jpg", image_buffer)
        if not ret:
            print("Failed to encode frame to JPEG")
            continue
        frame = buffer.tobytes()

        yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


def preprocess_image(image):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return gray


def align_images(master, input):
    try:
        master_preprocessed = preprocess_image(master)
        input_preprocessed = preprocess_image(input)
        sift = cv2.SIFT_create(nfeatures=10000)
        keypoints1, descriptors1 = sift.detectAndCompute(master_preprocessed, None)
        keypoints2, descriptors2 = sift.detectAndCompute(input_preprocessed, None)
        bf = cv2.BFMatcher()
        raw_matches = bf.knnMatch(descriptors1, descriptors2, k=2)
        good_matches = []
        for m, n in raw_matches:
            if m.distance < 0.75 * n.distance:
                good_matches.append(m)
        good_matches = sorted(good_matches, key=lambda x: x.distance)
        if len(good_matches) < 4:
            raise AlignmentError("Not enough good matches")
        pts1 = np.float32([keypoints1[m.queryIdx].pt for m in good_matches]).reshape(
            -1, 1, 2
        )
        pts2 = np.float32([keypoints2[m.trainIdx].pt for m in good_matches]).reshape(
            -1, 1, 2
        )
        H, mask = cv2.findHomography(pts2, pts1, cv2.RANSAC, 2.0)
        aligned_image = cv2.warpPerspective(
            input, H, (master.shape[1], master.shape[0])
        )

        _, mask_master = cv2.threshold(
            master_preprocessed, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )
        mask_contours, _ = cv2.findContours(
            mask_master, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        aligned_image_gray = cv2.cvtColor(aligned_image, cv2.COLOR_BGR2GRAY)
        absolute = cv2.absdiff(master_preprocessed, aligned_image_gray)
        aligned_thresh = cv2.threshold(
            aligned_image_gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
        )[1]
        result = cv2.bitwise_or(mask_master, aligned_thresh)
        result = cv2.threshold(result, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

        master_thresh = cv2.threshold(
            master_preprocessed, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
        )[1]
        master_cont = cv2.findContours(
            master_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )[0]
        return result, aligned_image, master_cont, master_thresh, absolute
    except Exception as e:
        raise AlignmentError(f"Image alignment failed: {str(e)}")


def clean_image(image):
    num_labels, labels = cv2.connectedComponents(image)
    min_size_threshold = 30
    height_threshold = 1000
    width_threshold = 2
    valid_object_count = 0

    # Create single channel output image
    output_image = np.zeros_like(image, dtype=np.uint8)
    component_sizes = np.bincount(labels.ravel())

    for label in range(1, num_labels):
        if component_sizes[label] > min_size_threshold:
            coords = np.argwhere(labels == label)
            min_y, min_x = coords.min(axis=0)
            max_y, max_x = coords.max(axis=0)
            width, height = max_x - min_x, max_y - min_y

            if (width < width_threshold and height < height_threshold) or (
                height < width_threshold and width < height_threshold
            ):
                output_image[labels == label] = 0  # Exclude objects
            else:
                output_image[labels == label] = 255  # Valid objects in white
                valid_object_count += 1

    return output_image


def find_defect(master, images, model_name):
    try:
        classes = [0] * NO_FRAMES
        differences = [None] * NO_FRAMES
        contours_no = [0] * NO_FRAMES
        mapping = [0] * NO_FRAMES
        operator_dependent = False
        for i, img_path in enumerate(images):
            input_path = img_path
            input = cv2.imread(input_path)
            input = cv2.resize(input, (master.shape[1], master.shape[0]))
            difference, aligned_image, mask_contours, mask_master, absolute = (
                align_images(master, input)
            )
            master_copy = master.copy()
            cv2.drawContours(master_copy, mask_contours, -1, (0, 255, 0), 3)
            cv2.imwrite(f"master{i}.png", master_copy)
            print(len(mask_contours))
            _, thresholded_diff = cv2.threshold(
                difference, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
            )
            cv2.imwrite(f"diff{i}.png", thresholded_diff)
            cleaned_diff = clean_image(thresholded_diff)
            cnt, _ = cv2.findContours(
                cleaned_diff, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            copy = aligned_image.copy()
            counter = 0
            for captured_cnt in cnt:
                for master_cnt in mask_contours:
                    if cv2.matchShapes(captured_cnt, master_cnt, 1, 0.0) < 0.1:
                        cv2.drawContours(copy, [captured_cnt], -1, (0, 255, 0), 3)
                        counter += 1
                        break
            cv2.imwrite(f"red{i}.png", copy)
            contours_no[i] = len(cnt)
            mapping[i] = counter
            differences[i] = cleaned_diff
            if len(cnt) == 0 and counter == 0:
                classes[i] = 1
            elif len(cnt) > 0 and counter == 0:
                operator_dependent = True
        print(classes)
        print(contours_no)
        print(mapping)
        max_idx = contours_no.index(max(contours_no))
        if classes.count(1) >= 2:
            captured_correct = cv2.imread(images[max_idx])
            cv2.imwrite("difference_correct.png", differences[max_idx])
            diff_cirr = cv2.imread("difference_correct.png")
            return captured_correct, diff_cirr, "pass", operator_dependent
        captured_incorrect = cv2.imread(images[max_idx])
        cv2.imwrite("different_incorrect.png", differences[max_idx])
        diff = cv2.imread("different_incorrect.png")
        return captured_incorrect, diff, "fail", operator_dependent
    except Exception as e:
        raise ImageProcessingError(f"Defect detection failed: {str(e)}")


def capture_distinct_frames(num_frames=3, min_delay=0.5):
    try:
        frames = []
        for i in range(num_frames):
            # Clear buffer
            ueye.is_CaptureVideo(hCam, ueye.IS_DONT_WAIT)
            time.sleep(min_delay)  # Delay between captures

            # Capture new frame
            image_buffer = np.zeros((camera_height, camera_width, 3), dtype=np.uint8)
            ret = ueye.is_FreezeVideo(hCam, ueye.IS_WAIT)
            if ret != ueye.IS_SUCCESS:
                raise RuntimeError(f"Frame capture failed: {ret}")

            # Copy to buffer
            ueye.is_CopyImageMem(hCam, mem_ptr, mem_id, image_buffer.ctypes.data)

            frames.append(image_buffer.copy())
            filename = f"frame_{i}.png"
            cv2.imwrite(os.path.join(save_directory, filename), image_buffer)

        return [
            os.path.join(save_directory, f"frame_{i}.png") for i in range(num_frames)
        ]
    except Exception as e:
        raise Exception("Not enought images captured")


def save_in_directory(root_dir, subdir, images, names):
    try:
        # Create root directory if it doesn't exist
        if not os.path.exists(root_dir):
            os.makedirs(root_dir)

        # Create subdirectory inside root directory
        subdir_path = os.path.join(root_dir, subdir)
        if not os.path.exists(subdir_path):
            os.makedirs(subdir_path)

        for image, name in zip(images, names):
            try:
                header, encoded = image.split(",", 1)

                # Extract the image extension from the data URL header
                if "image/" in header:
                    ext = header.split("/")[1].split(";")[0]
                    if ext == "jpeg":
                        ext = "jpg"
                    name = f"{name}.{ext}"
                else:
                    raise ValueError(f"Invalid data URL header for image: {name}")

                image_data = base64.b64decode(encoded)
                image = cv2.imdecode(
                    np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR
                )

                image_path = os.path.join(subdir_path, name)

                # Save the image
                if not cv2.imwrite(image_path, image):
                    raise IOError(f"Failed to write image to {image_path}")
            except Exception as e:
                print(e)
                raise Exception(f"Failed to save image {name}: {str(e)}")

        return
    except Exception as e:
        print(e)
        raise Exception(f"Failed to save images: {str(e)}")


def registers_to_float(registers):
    combined = (registers[0] << 16) + registers[1]
    return struct.unpack("f", struct.pack("I", combined))[0]


def read_modbus_rtu(
    port, baudrate, parity, stopbits, bytesize, slave_id, register_start, register_count
):
    # print(f"Connecting to Modbus RTU device at {port} (Slave ID: {slave_id})...")
    client = ModbusSerialClient(
        port=port,
        baudrate=baudrate,
        parity=parity,
        stopbits=stopbits,
        bytesize=bytesize,
        timeout=1,
    )

    if not client.connect():
        print("Failed to connect to Modbus RTU device.")
        raise Exception("Failed to connect to Modbus RTU device.")

    try:
        # print("Connected. Reading registers...")
        response = client.read_holding_registers(
            address=register_start, count=register_count, slave=slave_id
        )

        if response.isError():
            print(f"Error reading registers: {response}")
            raise Exception(f"Error reading registers: {response}")

        # print(f"Data read successfully: {response.registers}")
        return response.registers

    except ModbusException as e:
        print(f"Modbus Exception occurred: {e}")
        raise Exception(f"Modbus Exception occurred: {e}")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise Exception(f"An unexpected error occurred: {e}")

    finally:
        client.close()
        # print("Connection closed.")


def read_modbus_tcp(ip, port, slave_id, register_start, register_count):
    """Read Modbus registers via TCP."""
    print(f"Connecting to Modbus TCP device at {ip}:{port} (Slave ID: {slave_id})...")
    client = ModbusTcpClient(host=ip, port=port, timeout=1)

    if not client.connect():
        print("Failed to connect to Modbus TCP device.")
        return None

    try:
        print("Connected. Reading registers...")
        response = client.read_holding_registers(
            address=register_start, count=register_count, slave=slave_id
        )

        if response.isError():
            print(f"Error reading registers: {response}")
            return None

        return response.registers

    except ModbusException as e:
        print(f"Modbus Exception occurred: {e}")
        return None

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

    finally:
        client.close()
        print("Connection closed.")


def modbus_serial(
    SERIAL_PORT,
    BAUDRATE,
    PARITY,
    STOPBITS,
    BYTESIZE,
    SLAVE_ID,
    DATE_REGISTER_START,
    SR_REGISTER_START,
    REGISTER_COUNT,
):
    data1 = read_modbus_rtu(
        str(SERIAL_PORT),
        int(BAUDRATE),
        str(PARITY),
        int(STOPBITS),
        int(BYTESIZE),
        int(SLAVE_ID),
        int(DATE_REGISTER_START) - 1,
        int(REGISTER_COUNT),
    )
    data2 = read_modbus_rtu(
        str(SERIAL_PORT),
        int(BAUDRATE),
        str(PARITY),
        int(STOPBITS),
        int(BYTESIZE),
        int(SLAVE_ID),
        int(SR_REGISTER_START) - 1,
        int(REGISTER_COUNT),
    )
    print(data1, data2)
    if data1 is not None and data2 is not None:

        sr_add = str(int(registers_to_float(data2)))
        return str(int(registers_to_float(data1))) + "0" * (6 - len(sr_add)) + sr_add
    else:
        return "Error while reading"


def ethernet_serial(
    IP,
    PORT,
    SLAVE_ID,
    DATE_REGISTER_START,
    SR_REGISTER_START,
    REGISTER_COUNT,
):
    data1 = read_modbus_tcp(
        str(IP),
        int(PORT),
        int(SLAVE_ID),
        int(DATE_REGISTER_START) - 1,
        int(REGISTER_COUNT),
    )
    data2 = read_modbus_tcp(
        str(IP),
        int(PORT),
        int(SLAVE_ID),
        int(SR_REGISTER_START) - 1,
        int(REGISTER_COUNT),
    )
    print(data1, data2)
    if data1 is not None and data2 is not None:

        sr_add = str(int(registers_to_float(data2)))
        return str(int(registers_to_float(data1))) + "0" * (6 - len(sr_add)) + sr_add
    else:
        return "Error while reading"


def get_serial_ports():
    return [port.device for port in serial.tools.list_ports.comports()]


def modbus_usb(
    BAUDRATE,
    PARITY,
    STOPBITS,
    BYTESIZE,
    SLAVE_ID,
    DATE_REGISTER_START,
    SR_REGISTER_START,
    REGISTER_COUNT,
):
    print("in usb----->")

    ports = get_serial_ports()
    print(ports)
    for SERIAL_PORT in ports[::-1]:
        data1 = read_modbus_rtu(
            str(SERIAL_PORT),
            int(BAUDRATE),
            str(PARITY),
            int(STOPBITS),
            int(BYTESIZE),
            int(SLAVE_ID),
            int(DATE_REGISTER_START) - 1,
            int(REGISTER_COUNT),
        )
        data2 = read_modbus_rtu(
            str(SERIAL_PORT),
            int(BAUDRATE),
            str(PARITY),
            int(STOPBITS),
            int(BYTESIZE),
            int(SLAVE_ID),
            int(SR_REGISTER_START) - 1,
            int(REGISTER_COUNT),
        )

        if data1 is not None and data2 is not None:
            sr_add = str(int(registers_to_float(data2)))
            return (
                str(int(registers_to_float(data1))) + "0" * (6 - len(sr_add)) + sr_add
            )
    return "Communication Error"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/video_feed")
def video_feed():
    return Response(
        generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@app.route("/capture", methods=["POST"])
def capture():
    try:
        model_name = request.json["model_type"]
        if not model_name:
            return ImageProcessingError("Serial number or model name not provided"), 400
        captured_images = capture_distinct_frames(
            num_frames=NO_FRAMES, min_delay=DELAY_FRAMES
        )
        if len(captured_images) < NO_FRAMES:
            return jsonify({"error": "Could not capture enough distinct frames"}), 500
        if "master" not in request.json:
            return jsonify({"error": "Master image not provided"}), 400
        master_data_url = request.json["master"]
        header, encoded = master_data_url.split(",", 1)
        master_data = base64.b64decode(encoded)
        master_path = "fetched_master.png"
        with open(master_path, "wb") as f:
            f.write(master_data)
        master = cv2.imread(master_path)
        image, diff, res, od = find_defect(master, captured_images, model_name)
        _, buffer = cv2.imencode(".png", image)
        _, diff = cv2.imencode(".png", diff) if diff is not None else (None, None)
        image_base64 = base64.b64encode(buffer).decode("utf-8")
        diff_base64 = (
            base64.b64encode(diff).decode("utf-8") if diff is not None else None
        )
        return jsonify(
            {
                "image": f"data:image/png;base64,{image_base64}",
                "diff": (
                    f"data:image/png;base64,{diff_base64}" if diff is not None else None
                ),
                "res": res,
                "od": od,
            }
        )
    except (CameraError, ImageProcessingError, AlignmentError) as e:
        raise
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        raise


@app.route("/capture_master_image", methods=["POST"])
def capture_master_image():
    try:
        # Capture a single frame
        image_buffer = np.zeros((camera_height, camera_width, 3), dtype=np.uint8)
        ret = ueye.is_FreezeVideo(hCam, ueye.IS_WAIT)
        if ret != ueye.IS_SUCCESS:
            raise CameraError(f"Frame capture failed: {ret}")

        # Copy to buffer
        ueye.is_CopyImageMem(hCam, mem_ptr, mem_id, image_buffer.ctypes.data)

        # Encode image to JPEG format
        ret, buffer = cv2.imencode(".jpg", image_buffer)
        if not ret:
            raise ImageProcessingError("Failed to encode frame to JPEG")

        frame = buffer.tobytes()
        image_base64 = base64.b64encode(frame).decode("utf-8")

        return jsonify({"image": f"data:image/jpeg;base64,{image_base64}"})
    except (CameraError, ImageProcessingError) as e:
        print(e)
        raise
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        raise


@app.route("/getSerialNo", methods=["POST"])
def get_serial_no():
    try:
        COMM_PROTOCOL = request.json["com_protocol"]
        SLAVE_ID = request.json["com_configure"]["slave_id"]
        DATE_REGISTER_START = request.json["com_configure"]["date_register"]
        SR_REGISTER_START = request.json["com_configure"]["serial_no_register"]
        REGISTER_COUNT = request.json["com_configure"]["register_count"]
        if COMM_PROTOCOL == "modbus":
            SERIAL_PORT = request.json["com_configure"]["serial_port"]
            BAUDRATE = request.json["com_configure"]["baud_rate"]
            PARITY = request.json["com_configure"]["parity"]
            STOPBITS = request.json["com_configure"]["stop_bits"]
            BYTESIZE = request.json["com_configure"]["byte_size"]
            serial_no = modbus_serial(
                SERIAL_PORT,
                BAUDRATE,
                PARITY,
                STOPBITS,
                BYTESIZE,
                SLAVE_ID,
                DATE_REGISTER_START,
                SR_REGISTER_START,
                REGISTER_COUNT,
            )
            return jsonify({"serial_no": serial_no})
        elif COMM_PROTOCOL == "ethernet":
            time.sleep(8)
            IP = request.json["com_configure"]["ip"]
            PORT = request.json["com_configure"]["port"]
            serial_no = ethernet_serial(
                IP,
                PORT,
                SLAVE_ID,
                DATE_REGISTER_START,
                SR_REGISTER_START,
                REGISTER_COUNT,
            )
            return jsonify({"serial_no": serial_no})
        elif COMM_PROTOCOL == "usb":
            BAUDRATE = request.json["com_configure"]["baud_rate"]
            PARITY = request.json["com_configure"]["parity"]
            STOPBITS = request.json["com_configure"]["stop_bits"]
            BYTESIZE = request.json["com_configure"]["byte_size"]

            serial_no = modbus_usb(
                BAUDRATE,
                PARITY,
                STOPBITS,
                BYTESIZE,
                SLAVE_ID,
                DATE_REGISTER_START,
                SR_REGISTER_START,
                REGISTER_COUNT,
            )
            return jsonify({"serial_no": serial_no})

    except SerialError as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        raise


@app.route("/saveImages", methods=["POST"])
def save_images():
    try:
        images = request.json["images"]
        names = request.json["names"]
        model_type = request.json["model_type"]
        save_in_directory("D:/Rishabh_Images/", model_type, images, names)
        return jsonify({"message": "Images Saved Successfully!"})
    except:
        raise Exception("Save Image Error!")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
