import {AppProps } from 'next/app';
import '../../styles/globals.scss';
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from 'react-toastify'

function MyApp({ Component, pageProps }:AppProps) {
  return (
              <ToastContainer autoClose={3000}/> 
        )
}

export default MyApp
