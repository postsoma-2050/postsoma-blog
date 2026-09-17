import { RiMusic2Line, RiAttachment2 } from "@remixicon/react";
import type { MediaItem } from "@/lib/posts";

interface PostMediaGalleryProps {
  media: MediaItem[];
  postId?: string;
  postName?: string;
}

export default function PostMediaGallery({ media, postId, postName }: PostMediaGalleryProps) {
  if (!media || media.length === 0) return null;

  return (
    <section className="mb-10 mt-2 space-y-5">
      {media.map((item, idx) => {
        if (item.kind === "image") {
          const isNotionInternal =
            item.url.includes("amazonaws.com") ||
            item.url.includes("notion.so") ||
            item.url.includes("X-Amz-Expires");
          const imageUrl =
            isNotionInternal && postId
              ? `/api/image?pageId=${postId}&mediaIndex=${idx}`
              : item.url;

          return (
            <div
              key={idx}
              className="relative w-full overflow-hidden rounded-2xl border-[0.5px] border-[var(--border-subtle)] shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={item.name ?? postName ?? "Post media"}
                className="w-full h-auto rounded-2xl"
                loading="lazy"
              />
            </div>
          );
        }
        if (item.kind === "video") {
          return (
            <div
              key={idx}
              className="overflow-hidden rounded-lg"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              <video
                src={item.url}
                controls
                preload="metadata"
                className="w-full rounded-lg"
              >
                Your browser does not support video playback.
              </video>
            </div>
          );
        }
        if (item.kind === "audio") {
          return (
            <div
              key={idx}
              className="rounded-2xl px-4 py-3 border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)]"
            >
              {item.name && (
                <p className="mb-2 font-mono text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                  <RiMusic2Line className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{item.name}</span>
                </p>
              )}
              <audio src={item.url} controls preload="metadata" className="w-full">
                Your browser does not support audio playback.
              </audio>
            </div>
          );
        }
        return (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-2xl px-4 py-3 font-mono text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)]"
          >
            <RiAttachment2 className="w-4 h-4 text-[var(--text-muted)]" />
            <span>{item.name ?? "Download file"}</span>
          </a>
        );
      })}
    </section>
  );
}
