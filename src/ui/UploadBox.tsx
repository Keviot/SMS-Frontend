import { cn } from "../lib/cn";
import AddImageIcon from "../assets/images/Add image.png";

type UploadBoxProps = {
  label?: string;
  fileName?: string;
  fileSize?: string;
  progress?: number;
  error?: string;
  onChange?: (file: File) => void;
  accept?: string;
};

export default function UploadBox({
  label,
  fileName,
  fileSize,
  progress,
  error,
  onChange,
  accept = "image/*",
}: UploadBoxProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChange) {
      onChange(file);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-xs font-bold text-[#202224]">
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative rounded-xl border border-dashed bg-white transition-all duration-200",
          error ? "border-[#EF4444]" : "border-[#DFE4EC] hover:border-[#FF8A00]"
        )}
      >
        <input
          type="file"
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          onChange={handleFileChange}
          accept={accept}
        />
        <div className="p-4">
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
              <img src={AddImageIcon} alt="Upload" className="h-10 w-10 object-contain" />
              <p className="mt-3 text-sm font-bold text-[#202224]">
                <span className="text-[#5678E9]">Upload a file</span> or drag and drop
              </p>
              <p className="mt-1 text-xs font-semibold text-[#8A909B]">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          )}
        </div>
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