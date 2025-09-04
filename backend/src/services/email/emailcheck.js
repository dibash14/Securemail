import dns from "dns";

//spliting email into local and domain
export function extractDomain(email) {
    return (email.split("@")[1] || "").toLowerCase();
}
//check the format  of the email
export function isValidFormat(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
//chekc the TLD of email
export function hasValidTLD(domain) {
    const SUSPECIOUS_TLDS = ["xyz", "top", "info", "click", "ru"];
    const tld = domain.split(".").pop();
    return !SUSPECIOUS_TLDS.includes(tld);
}

export function checkMX(domain){
    return new Promise((resolve)=>{
        dns.resolveMx(domain,(err,address)=>{
            if (err || !address || address.length ===0){
                resolve(false);
            }
            else{
                resolve(true);
            }
        })
    })

}
