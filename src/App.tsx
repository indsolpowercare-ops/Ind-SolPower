import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './components/Login'
import UserRegistrationForm from './components/UserRegistration'
import Dashboard from './components/Dashboard'
import Installation from './components/Installation'
import CustomerFeedbackForm from './components/Feedback'
import Documents from './components/Documents'
import CustomerDetails from './admin/customerDetails'
import CustomerDocuments from './admin/customerDocuments'
import InstallationPhotos from './admin/installationPhotos'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<UserRegistrationForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/installation" element={<Installation />} />
        <Route path="/feedback" element={<CustomerFeedbackForm />} />
        <Route path="/documents" element={<Documents />} />

        {/* Admin Routes */}
        <Route path="/admin/customer-details" element={<CustomerDetails />} />
        <Route path="/admin/customer-documents" element={<CustomerDocuments />} />
        <Route path="/admin/installation-photos" element={<InstallationPhotos />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
