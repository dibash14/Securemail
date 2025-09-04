// import linkify from "linkifyjs";
// import he from "he";

// const KEYWORDS=["urgernt","password","click here","verify account","lottery"];

// //to extract link from email body
// export function extractLinks(text=""){
//     const decoded =he.decode(text);
//     return linkify.find(decoded)
//         .filter(m=> m.type === "url")
//         .map(m=> m.href);
// }

// //simple phising heuristic 
// export function phishingHeuristics({subject="",body=""})
// {
//     const score= KEYWORDS.reduce((acc,word)=>{
//         if ((subject + body).toLowerCase().includes(word)) return acc + 20;
//         return acc ;
//     },0);


//     const links = extractLinks(body);
//     return {score,links}
// }
