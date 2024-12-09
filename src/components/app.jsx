
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import HomePage from "./home-page"
import NewConnection from "./new-connection"
import PayBill from "./pay-bill"
import RaiseComplaint from "./raise-complaint"
import TrackConnectionStatus from "./track-connection-status"
import TrackComplaint from "./track-complaint"
import MyAccount from "./my-account"
import Layout from "./layout"
import MeterReading from "./meter-reading"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="new-connection" element={<NewConnection />} />
          <Route path="pay-bill" element={<PayBill />} />
          <Route path="raise-complaint" element={<RaiseComplaint />} />
          <Route path="track-connection" element={<TrackConnectionStatus />} />
          <Route path="track-complaint" element={<TrackComplaint />} />
          <Route path="my-account" element={<MyAccount />} />
          <Route path="reading" element={<MeterReading/>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App