import { ProgramForm } from "../_components/program-form";

export const metadata = {
  title: "Create Program | Rope4 Admin",
};

export default function CreateProgramPage() {
  return <ProgramForm isEditing={false} />;
}
