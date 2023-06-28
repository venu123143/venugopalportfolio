const multer = require('multer')
// const GridFsStorage = require('multer-gridfs-storage')
const Storage= multer.diskStorage({
    destination:'uploads',
    filename:(req,file,cb)=>{
        cb(null, `${Date.now()}--avatar-${file.originalname}` )
    }
})


const upload = multer({storage:Storage})
module.exports = upload


