export function hasMultipleExtension(filename) {
    if (!filename) return false;
    const parts = filename.split('.');
    return parts.length > 2;
}

// attachments.forEach(att =>{
//     if(hasMultipleExtension(att.filename)){
//         console.log(`Double extesion detected ${att.filename}`);
//     }
// })