import { redirect } from "next/navigation";

export default function ContentCatalogRoot({ params }: { params: { brandId: string } }) {
  redirect(`/${params.brandId}/cc/products`);
}
