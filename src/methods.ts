export type MethodId = "para" | "gtd" | "zettelkasten";

export interface MethodPack {
  id: MethodId;
  label: string;
  tasksFile: string | null;
}

export const SKELETON_DIR = "skeleton";
export const CHAPTER_FILE = "chapter.md";
export const ROUTING_FILE = "save-routing.md";

export const METHODS: readonly MethodPack[] = [
  { id: "para", label: "PARA", tasksFile: "tasks.md" },
  { id: "gtd", label: "GTD", tasksFile: null },
  { id: "zettelkasten", label: "Zettelkasten", tasksFile: "tasks.md" },
];

export function getMethod(id: string): MethodPack | undefined {
  return METHODS.find((method) => method.id === id.toLowerCase());
}
