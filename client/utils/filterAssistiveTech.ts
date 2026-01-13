import type { AssistiveTechItem } from "@/data/assistiveTech";

type Filters = {
  category?: string | null;
  tags?: string[];
};

export function filterAssistiveTech(
  items: AssistiveTechItem[],
  filters: Filters
) {
  const { category, tags = [] } = filters;

  return items.filter((item) => {
    if (category && item.category !== category) {
      return false;
    }

    if (
      tags.length > 0 &&
      !tags.some((tag) => item.tags.includes(tag))
    ) {
      return false;
    }

    return true;
  });
}