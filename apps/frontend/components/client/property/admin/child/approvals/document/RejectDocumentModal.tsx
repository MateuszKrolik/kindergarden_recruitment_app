import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const rejectSchema = z.object({
  reason: z
    .string()
    .min(1, "Rejection reason is required!")
    .max(200, "Reason is too long!"),
});

type RejectFormValues = z.infer<typeof rejectSchema>;

type RejectDocumentModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

export function RejectDocumentModal({
  open,
  onClose,
  onSubmit,
}: RejectDocumentModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: "" },
  });

  const handleFormSubmit = (data: RejectFormValues) => {
    onSubmit(data.reason);
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
          reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Rejection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-3">
          <div className="grid gap-3">
            <Label htmlFor="reason">Rejection Reason*</Label>
            <Input
              id="reason"
              placeholder="Enter reason for rejection..."
              {...register("reason")}
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason.message}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Reject</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
