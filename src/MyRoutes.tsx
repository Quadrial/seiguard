import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Explorer from './pages/Explorer'
import Suspicious from './pages/Suspicious'
import NewContracts from './pages/NewContracts'
import WalletView from './pages/WalletView'
import TransactionDetails from './pages/TransactionDetails'

import AddressDetails from './pages/AddressDetails'
import Chatbot from './pages/Chatbot'

const MyRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explorer" element={<Explorer />} />
      <Route path="/suspicious" element={<Suspicious/>} />
      <Route path="/contracts" element={<NewContracts/>} />
      <Route path="/wallet" element={<WalletView/>} />
      <Route path="/transaction/:hash" element={<TransactionDetails/>} />
      
      <Route path="/address/:address" element={<AddressDetails/>} />
      <Route path="/chatbot" element={<Chatbot/>} />
    </Routes>
  )
}

export default MyRoutes