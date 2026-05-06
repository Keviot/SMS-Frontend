import { UploadCloud } from "lucide-react";
import { cn } from "../../lib/cn";

type UploadBoxProps = {
  label?: string;
  fileName?: string;
  fileSize?: string;
  progress?: number;
  error?: string;
};

export default function UploadBox({
  label,
  fileName,
  fileSize,
  progress,
  error,
}: UploadBoxProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-xs font-bold text-[#202224]">
          {label}
        </label>
      )}

      <div
        className={cn(
          "rounded-xl border border-dashed bg-white p-4 transition-all duration-200",
          error ? "border-[#EF4444]" : "border-[#DFE4EC] hover:border-[#FF8A00]"
        )}
      >
        {fileName ? (
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-extrabold text-[#202224]">
                  {fileName}
                </h4>
                <p className="mt-1 text-xs font-semibold text-[#8A909B]">
                  {fileSize}
                </p>
              </div>

              {typeof progress === "number" && (
                <span className="text-xs font-extrabold text-[#FF5630]">
                  {progress}%
                </span>
              )}
            </div>

            {typeof progress === "number" && (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F1F5F9]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF5630] to-[#FF9F1C]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <UploadCloud className="text-[#FF8A00]" size={28} />
            <p className="mt-3 text-sm font-bold text-[#202224]">
              Upload a file or drag and drop
            </p>
            <p className="mt-1 text-xs font-semibold text-[#8A909B]">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        )}
      </div>

      <p
        className={cn(
          "mt-1 min-h-4 text-[11px] font-semibold",
          error ? "text-[#EF4444]" : "text-transparent"
        )}
      >
        {error || "placeholder"}
      </p>
    </div>
  );
}