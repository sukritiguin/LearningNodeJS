// upload.ts
// import multer from 'multer';
// import multerS3 from 'multer-s3';



// const upload = multer({
//   storage: multerS3({
//     s3,
//     bucket: configAWSS3.bucket as string,
//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//       cb(null, `${Date.now().toString()}-${file.originalname}`);
//     },
//   }),
// });

// const uploadMultiple = upload.fields([
//   { name: 'coverImage', maxCount: 1 },
//   { name: 'file', maxCount: 1 },
// ]);


import multer from "multer";
import path from "node:path";


const upload = multer({
    dest: path.resolve(__dirname, '../../public/data/uploads'),
    limits: {fieldSize: 2e7},

})

export {upload};
