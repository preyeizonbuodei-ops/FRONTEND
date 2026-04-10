// import { Link } from "react-router-dom";
// import { useAuth } from "../context/authContex";


// function Navbar()  {
    
//     const { auth } = useAuth()

//     return(
//         <>
//             <nav className="bg-gray-900 p-4 text-white text-3xl">
//                 <div className="container mx-auto flex justify-between items-center">
//                     <Link to="/">
//                         Home
//                     </Link>
//                     <div>
//                         {auth?.accessToken ? <>
//                             <button>
//                                 Logout
//                             </button>
//                         </> : <>
//                             <Link to='/register' className="text-white">Register</Link>
//                             <Link to='/Login' className="text-white">Login</Link>
//                         </>}
//                     </div>
//                 </div>
//             </nav>
            
//         </>
//     )
// }

// export default Navbar;