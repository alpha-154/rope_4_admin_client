import { NewsForm } from "../_components/news-form";

export const metadata = {
  title: "Write Article | Rope4 Admin",
};

export default function CreateNewsPage() {
  return <NewsForm isEditing={false} />;
}
