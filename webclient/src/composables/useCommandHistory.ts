import { ref } from 'vue';

const HISTORY_SIZE = 30;

export const useCommandHistory = () => {
    const history = ref<string[]>([]);
    const position = ref(-1);

    const push = (cmd: string) => {
        if (!cmd.trim()) return;
        if (history.value[0] !== cmd) {
            history.value.unshift(cmd);
            if (history.value.length > HISTORY_SIZE) {
                history.value.pop();
            }
        }
        position.value = -1;
    };

    const prev = (): string | null => {
        if (!history.value.length) return null;
        position.value = Math.min(position.value + 1, history.value.length - 1);
        return history.value[position.value];
    };

    const next = (): string | null => {
        if (position.value <= 0) {
            position.value = -1;
            return '';
        }
        position.value--;
        return history.value[position.value];
    };

    const reset = () => {
        position.value = -1;
    };

    return { push, prev, next, reset };
};
