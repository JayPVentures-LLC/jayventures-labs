// styled-jsx type augmentation
// This ensures React recognizes `jsx` and `global` props on <style> elements

declare namespace React {
  interface StyleHTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}
