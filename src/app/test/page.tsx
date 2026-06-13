import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function TestPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*");

  console.log(data, error);

  return (
    <div className="text-white p-10">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}