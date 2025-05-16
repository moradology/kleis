// Inspired by react-hot-toast library
import * as React from 'react';
import type { ToastProps as RadixToastProps, ToastActionElement as RadixToastActionElement } from '@/components/ui/toast'; // Use actual Radix types

type ToasterToast = RadixToastProps & { // Use RadixToastProps
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: RadixToastActionElement; // Use RadixToastActionElement
};

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ActionType =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'UPDATE_TOAST'; toast: Partial<ToasterToast> }
  | { type: 'DISMISS_TOAST'; toastId?: ToasterToast['id'] }
  | { type: 'REMOVE_TOAST'; toastId?: ToasterToast['id'] };

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type MemoryState = {
  toasts: ToasterToast[];
};

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: MemoryState, action: ActionType): MemoryState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      // ! SideEffects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: MemoryState) => void> = [];

let memoryState: MemoryState = { toasts: [] };

function dispatch(action: ActionType) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, 'id'>;

// Remove local ToastProps if it's identical to RadixToastProps or adjust as needed.
// For now, assuming RadixToastProps from import is sufficient.
// interface ToastProps
//   extends Omit<React.ComponentPropsWithoutRef<typeof ToastPrimitive>, 'variant'> {
//   variant?: 'default' | 'destructive';
// }
// import type { ToastProps as ToastPrimitiveProps } from '@/components/ui/toast'; // Already imported as RadixToastProps
// import type { ToastActionElement as ToastPrimitiveActionElement } from '@/components/ui/toast'; // Already imported as RadixToastActionElement

// These were empty interfaces causing errors, remove them.
// interface ToastPrimitive extends React.ComponentPropsWithoutRef<typeof React.Component> {} // Placeholder
// interface ToastAction extends React.ComponentPropsWithoutRef<typeof React.Component> {} // Placeholder

function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<MemoryState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast, toast };