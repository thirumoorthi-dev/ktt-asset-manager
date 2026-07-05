const yup = require('yup');

const branchSchema = yup.object().shape({
  BranchName: yup.string().trim().required('Branch Name is required').min(2, 'Branch Name must be at least 2 characters')
});

const departmentSchema = yup.object().shape({
  DepartmentName: yup.string().trim().required('Department Name is required').min(2, 'Department Name must be at least 2 characters')
});

const categorySchema = yup.object().shape({
  CategoryName: yup.string().trim().required('Category Name is required').min(2, 'Category Name must be at least 2 characters'),
  Description: yup.string().trim().nullable()
});

const returnReasonSchema = yup.object().shape({
  ReasonName: yup.string().trim().required('Reason Name is required').min(2, 'Reason Name must be at least 2 characters')
});

const employeeSchema = yup.object().shape({
  EmployeeCode: yup.string().trim().required('Employee Code is required').matches(/^[A-Z0-9-]{3,15}$/i, 'Employee Code must be alphanumeric and between 3-15 characters'),
  EmployeeName: yup.string().trim().required('Employee Name is required').min(2, 'Employee Name must be at least 2 characters'),
  Email: yup.string().trim().email('Invalid email address').required('Email is required'),
  Phone: yup.string().trim().nullable(),
  Branch: yup.string().required('Branch selection is required'),
  Department: yup.string().required('Department selection is required')
});

const assetSchema = yup.object().shape({
  UniqueId: yup.string().trim().required('Unique ID is required'),
  SerialNumber: yup.string().trim().required('Serial Number is required'),
  Make: yup.string().trim().required('Make is required'),
  Model: yup.string().trim().required('Model is required'),
  Value: yup.number().typeError('Value must be a number').required('Value is required').positive('Value must be a positive number'),
  Quantity: yup.number().typeError('Quantity must be an integer').required('Quantity is required').integer('Quantity must be an integer').min(1, 'Quantity must be at least 1'),
  Branch: yup.string().trim().required('Branch is required'),
  PurchaseDate: yup.string().trim().nullable(),
  CategoryId: yup.string().uuid('Invalid Category ID').required('Category is required')
});

const issueAssetSchema = yup.object().shape({
  AssetId: yup.string().uuid('Invalid Asset ID').required('Asset selection is required'),
  EmployeeId: yup.string().uuid('Invalid Employee ID').required('Employee selection is required'),
  IssueDate: yup.string().required('Issue Date is required'),
  Notes: yup.string().trim().nullable()
});

const returnAssetSchema = yup.object().shape({
  AssetId: yup.string().uuid('Invalid Asset ID').required('Asset selection is required'),
  ReturnBranch: yup.string().required('Return Branch selection is required'),
  ReturnDate: yup.string().required('Return Date is required'),
  Reason: yup.string().required('Return Reason selection is required'),
  Notes: yup.string().trim().nullable()
});

module.exports = {
  branchSchema,
  departmentSchema,
  categorySchema,
  returnReasonSchema,
  employeeSchema,
  assetSchema,
  issueAssetSchema,
  returnAssetSchema
};
