import api from "../services/api/axiosInstance";
import { useState } from "react";

const TestRefresh = () => {
  const [result, setResult] = useState("");

  const testProtectedApi = async () => {
    try {
      const res = await api.get("/auth/me");
      setResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error(err);
      setResult("Error: " + err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Test Refresh Token</h2>
      <button onClick={testProtectedApi}>Test Protected API</button>

      <pre style={{ marginTop: "20px" }}>{result}</pre>
    </div>
  );
};

export default TestRefresh;
