type LoadingProps = {
  message?: string;
};

const Loading = ({ message = "Loading..." }: LoadingProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center"
    >
      <div
        aria-hidden="true"
        className="size-10 animate-spin rounded-full border-4 border-foreground/15 border-t-accent motion-reduce:animate-none"
      />
      <p className="text-sm font-medium text-foreground/70">{message}</p>
    </div>
  );
};

export default Loading;
