import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { clearErrors } from '../slices/inspectionSlice';

const useErrorNotifier = ({ stateName }) => {
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar();
  const { error } = useSelector((state: any) => state[stateName]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(`Error: ${error}`, { variant: 'error' });
    }
  }, [error, enqueueSnackbar]);
  if (stateName === 'inspection') {
    dispatch(clearErrors())
  }
};

export default useErrorNotifier;