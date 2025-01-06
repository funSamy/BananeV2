import LoginForm from "@/components/forms/LoginForm";

export default function Login() {
  return (
    <div className="grid place-items-center h-full bg-primaryForeground">
      <LoginForm className="max-w-md w-full" />
    </div>
  );
}
