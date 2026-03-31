export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1.5 text-[0.76rem] text-rose-600">{message}</p>;
}
