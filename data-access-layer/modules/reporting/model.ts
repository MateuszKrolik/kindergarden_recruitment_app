import { DocumentType } from "../shared/types/reporting";

export type ParentDocument = {
  id: string;
  user_id: string;
  document_type: DocumentType;
  file_path: string;
};
