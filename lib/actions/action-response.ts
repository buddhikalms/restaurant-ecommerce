export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResponse<T = void> =
  | {
      success: true;
      message?: string;
      data?: T;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: FieldErrors;
    };
