export type MessageSet =
{
  action: `set`;
  propertyPath: string[];
  property: string;
  value: any;
};