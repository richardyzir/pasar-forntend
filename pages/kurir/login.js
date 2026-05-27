import { useEffect } from "react";
import { useRouter } from "next/router";

export default function KurirLogin() {
  const router = useRouter();
  useEffect(() => {
    router.push("/admin/login");
  }, []);
  return null;
}
