'use client'
import { useSelector } from 'react-redux'



export const useDataBasic = () => {
  const {data} = useSelector((state) => state.dataBasic)
 const urlRoot="https://localhost:7021"
 const webName=data?.nameWeb ||"منصة أثراء"
 const logo=urlRoot+"/UploadFileDataBasic/"+data?.urlLogo ||"logoA.png"
const description=data?.description ||" منصة أثراء هي مساحة لمشاركة ونشر الأبحاث والمقالات العلمية — مجتمع معرفي يربط الباحثين والمهتمين، ويقدّم محتوى موثوقًا بطريقة بصرية جذابة وسهلة الوصول."
const image=urlRoot+"/UploadFileDataBasic/"+data?.urlImage ||"logoA.png"
const title=data?.title ||"منصة أثراء المعرفية"
  return {urlRoot,webName,logo,description,image,title}
}

export default useDataBasic
 