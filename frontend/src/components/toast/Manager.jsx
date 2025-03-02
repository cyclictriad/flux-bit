import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Toast from './Toast';
import { removeToast } from '../../store/features/toastsSlice';

const ToastManager = () => {
    const toasts = useSelector(state => state.toasts.toasts);
    const dispatch = useDispatch();

    const handleRemoveToast = (id) => {
        dispatch(removeToast(id));
    };

    return <Toast toasts={toasts} removeToast={handleRemoveToast} />;
};

export default ToastManager;
