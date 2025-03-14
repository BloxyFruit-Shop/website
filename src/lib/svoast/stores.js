import { writable, get } from 'svelte/store'
import { ID, DEFAULT_OPTIONS, parseDuration, objectMerge } from './utils'
const TOASTS = writable([])
const addToast = (type, message, { opts, id }) => {
    const UUID = id || ID()
    const { title, closable, infinite, onMount, onRemove, duration, link } = objectMerge(DEFAULT_OPTIONS, opts)
    const DURATION = parseDuration(duration)
    const props = {
        id: UUID,
        type,
        title,
        message,
        duration: DURATION,
        closable,
        infinite,
        link
    }
    if (typeof window !== 'undefined')
        onMount?.();
    upsert(props, UUID);
    if (!infinite && type !== 'promise') {
        setTimeout(() => {
            removeById(UUID);
            onRemove?.();
        }, DURATION);
    }
    return UUID;
};
const upsert = (props, id) => {
    if (get(TOASTS).find((toast) => toast.id === id)) {
        TOASTS.update((toasts) => {
            return toasts.map((toast) => {
                if (toast.id === id)
                    return { ...toast, ...props };
                return toast;
            });
        });
    }
    else {
        TOASTS.update((toasts) => (toasts = get(position).includes('bottom') ? [...toasts, props] : [props, ...toasts]));
    }
};
const removeById = (id) => {
    if (get(TOASTS).find((el) => el.id === id))
        TOASTS.update((toasts) => toasts.filter((toast) => toast.id !== id));
};
const removeByIndex = (index) => {
    if (get(TOASTS)[index])
        TOASTS.update((toasts) => toasts.filter((_, i) => index !== i));
};
const removeAll = () => {
    TOASTS.set([]);
};
const info = (message, opts = DEFAULT_OPTIONS) => addToast('info', message, { opts });
const attention = (message, opts = DEFAULT_OPTIONS) => addToast('attention', message, { opts });
const success = (message, opts = DEFAULT_OPTIONS) => addToast('success', message, { opts });
const warning = (message, opts = DEFAULT_OPTIONS) => addToast('warning', message, { opts });
const error = (message, opts = DEFAULT_OPTIONS) => addToast('error', message, { opts });
const promise = (promise, opts) => {
    if (promise instanceof Promise === false)
        throw Error('`promise` is not a valid Promise.');
    const id = addToast('promise', opts.loading, { opts });
    opts?.onStart?.();
    promise
        .then((data) => {
        addToast('success', opts.success, { opts, id });
        opts?.onSuccess?.(data);
    })
        .catch((err) => {
        addToast('error', opts.error, { opts, id });
        opts?.onError?.(err);
    })
        .finally(() => {
        if (!opts?.infinite) {
            setTimeout(() => {
                removeById(id);
            }, parseDuration(opts.duration || DEFAULT_OPTIONS.duration));
        }
        opts?.onFinish?.();
    });
};
const createStore = () => {
    const { subscribe } = TOASTS;
    return {
        /**
         * Add a info type toast.\
         * Usually indicates information to the user, but isn’t important.
         * @param message The message to be displayed in the toast.
         * @param opts Options for the toast.
         */
        info,
        /**
         * Add an attention type toast.\
         * Indicate to the user with important information.
         * @param message The message to be displayed in the toast.
         * @param opts Options for the toast.
         */
        attention,
        /**
         * Add a success type toast.\
         * Indicates to the user something good has happened.
         * @param message The message to be displayed in the toast.
         * @param opts Options for the toast.
         */
        success,
        /**
         * Add a warning type toast.\
         * Tell the user something may be wrong but isn’t critical.
         * @param message The message to be displayed in the toast.
         * @param opts Options for the toast.
         */
        warning,
        /**
         * Add an error type toast.\
         * Alert the user something critical has happened.
         * @param message The message to be displayed in the toast.
         * @param opts Options for the toast.
         */
        error,
        /**
         * Add a promise toast chain.\
         * Indicates to the user that something is happening in the background.
         * @param promise The promise to be used.
         * @param opts Options for the promise chain.
         */
        promise,
        /**
         * Remove a toast based on the unique ID.
         * @param id The unique ID of the toast.
         */
        removeById,
        /**
         * Remove a toast based on the index.
         * @param index The index of the toast
         */
        removeByIndex,
        /**
         * Removes all toasts.
         */
        removeAll,
        subscribe
    };
};
export const toast = createStore();
export const position = writable('bottom-left');
