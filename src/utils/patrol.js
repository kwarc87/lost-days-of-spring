// Returns whether `current` has reached or passed `target` along `directionSign`.
export function hasPassedTarget(current, target, directionSign) {
    if (directionSign > 0) {
        return current >= target;
    }
    if (directionSign < 0) {
        return current <= target;
    }
    return true;
}
