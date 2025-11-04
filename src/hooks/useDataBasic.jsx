'use client'
import { useSelector } from 'react-redux'



export const useDataBasic = () => {
  const {data} = useSelector((state) => state.dataBasic)
 const urlRoot="https://localhost:7021"
 const webName=data?.nameWeb ||""
 const logo=urlRoot+"/UploadFileDataBasic/"+data?.urlLogo ||""
const description=data?.description ||""
const image=urlRoot+"/UploadFileDataBasic/"+data?.urlImage ||""
const title=data?.title ||""
  return {urlRoot,webName,logo,description,image,title}
}

export default useDataBasic
 