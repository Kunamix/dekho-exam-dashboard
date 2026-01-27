WIP: jab subject ko delete karte hai toh agar topic or test hai subject par toh subject delete nahi hua

WIP : ham kisi bhi question ka subject or topic nahi badal pa rahe hai

axios success response : const response = axios.get();
{
    "data": {
        "statusCode": 200,
        "data": {
            "totalUsers": 1,
            "userGrowth": 100,
            "totalCategories": 2,
            "totalQuestions": 160,
            "activeSubscriptions": 0,
            "totalRevenue": 0,
            "revenueGrowth": 100
        },
        "message": "Dashboard stats fetched",
        "success": true
    },
    "status": 200,
    "statusText": "OK",
    "headers": {
        "content-length": "212",
        "content-type": "application/json; charset=utf-8"
    },
    "config": {
        "transitional": {
            "silentJSONParsing": true,
            "forcedJSONParsing": true,
            "clarifyTimeoutError": false
        },
        "adapter": [
            "xhr",
            "http",
            "fetch"
        ],
        "transformRequest": [
            null
        ],
        "transformResponse": [
            null
        ],
        "timeout": 0,
        "xsrfCookieName": "XSRF-TOKEN",
        "xsrfHeaderName": "X-XSRF-TOKEN",
        "maxContentLength": -1,
        "maxBodyLength": -1,
        "env": {},
        "headers": {
            "Accept": "application/json, text/plain, */*"
        },
        "baseURL": "http://localhost:8080/api/v1/admin",
        "withCredentials": true,
        "method": "get",
        "url": "/dashboard/stats",
        "allowAbsoluteUrls": true
    },
    "request": {}
}

axios fail response but route not found or fount but backend throw error still inside 
const { data, error, isError } = useDashboardStats(); 
try {
        const res = await api.get("/dashboard/stat");
        console.log("Response:", res);
        return res.data;
      } catch (error) {
        console.error("Dashboard stats error:", error);
        throw error; // ⚠️ important: rethrow for React Query
      }

{
    "message": "Request failed with status code 404",
    "name": "AxiosError",
    "stack": "AxiosError: Request failed with status code 404\n    at settle (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:1257:12)\n    at XMLHttpRequest.onloadend (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:1606:7)\n    at Axios.request (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:2223:41)\n    at async queryFn (http://localhost:5173/src/hooks/useDashboard.ts?t=1769491329943:12:29)",
    "config": {
        "transitional": {
            "silentJSONParsing": true,
            "forcedJSONParsing": true,
            "clarifyTimeoutError": false
        },
        "adapter": [
            "xhr",
            "http",
            "fetch"
        ],
        "transformRequest": [
            null
        ],
        "transformResponse": [
            null
        ],
        "timeout": 0,
        "xsrfCookieName": "XSRF-TOKEN",
        "xsrfHeaderName": "X-XSRF-TOKEN",
        "maxContentLength": -1,
        "maxBodyLength": -1,
        "env": {},
        "headers": {
            "Accept": "application/json, text/plain, */*"
        },
        "baseURL": "http://localhost:8080/api/v1/admin",
        "withCredentials": true,
        "method": "get",
        "url": "/dashboard/stat",
        "allowAbsoluteUrls": true
    },
    "code": "ERR_BAD_REQUEST",
    "status": 404
}

if route found but error throw to some reason then response is this but console.log in the catch console.log print : 
{
    "message": "Request failed with status code 401",
    "name": "AxiosError",
    "stack": "AxiosError: Request failed with status code 401\n    at settle (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:1257:12)\n    at XMLHttpRequest.onloadend (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:1606:7)\n    at Axios.request (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:2223:41)\n    at async Axios.request (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:2219:14)\n    at async queryFn (http://localhost:5173/src/hooks/useDashboard.ts?t=1769491649343:12:29)\n    at Axios.request (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:2223:41)\n    at async queryFn (http://localhost:5173/src/hooks/useDashboard.ts?t=1769491649343:12:29)",
    "config": {
        "transitional": {
            "silentJSONParsing": true,
            "forcedJSONParsing": true,
            "clarifyTimeoutError": false
        },
        "adapter": [
            "xhr",
            "http",
            "fetch"
        ],
        "transformRequest": [
            null
        ],
        "transformResponse": [
            null
        ],
        "timeout": 0,
        "xsrfCookieName": "XSRF-TOKEN",
        "xsrfHeaderName": "X-XSRF-TOKEN",
        "maxContentLength": -1,
        "maxBodyLength": -1,
        "env": {},
        "headers": {
            "Accept": "application/json, text/plain, */*"
        },
        "baseURL": "http://localhost:8080/api/v1/admin",
        "withCredentials": true,
        "method": "get",
        "url": "/dashboard/stats",
        "allowAbsoluteUrls": true,
        "_retry": true
    },
    "code": "ERR_BAD_REQUEST",
    "status": 401
},
code
: 
"ERR_BAD_REQUEST"
config
: 
{transitional: {…}, adapter: Array(3), transformRequest: Array(1), transformResponse: Array(1), timeout: 0, …}
message
: 
"Request failed with status code 401"
name
: 
"AxiosError"
request
: 
XMLHttpRequest {onreadystatechange: null, readyState: 4, timeout: 0, withCredentials: true, upload: XMLHttpRequestUpload, …}
response
: 
{data: {…}, status: 401, statusText: 'Unauthorized', headers: AxiosHeaders, config: {…}, …}
status
: 
401
stack
: 
"AxiosError: Request failed with status code 401\n    at settle (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:1257:12)\n    at XMLHttpRequest.onloadend (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:1606:7)\n    at Axios.request (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:2223:41)\n    at async Axios.request (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:2219:14)\n    at async queryFn (http://localhost:5173/src/hooks/useDashboard.ts?t=1769491649343:12:29)\n    at Axios.request (http://localhost:5173/node_modules/.vite/deps/axios.js?v=ce954270:2223:41)\n    at async queryFn (http://localhost:5173/src/hooks/useDashboard.ts?t=1769491649343:12:29)"



// react query

jo mutationFn return karega bahi responsebody me milega
return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const payload = {
        ...credentials,
        deviceName: navigator.userAgent,
        deviceType: "web",
      };

      const {data} = await api.post(
        "/auth/login",
        payload,
      );
      return data;
    },
    onSuccess: (responseBody) => {
      const { data, message } = responseBody;

      if (data.user && data.accessToken) {

        toast.success("Welcome back!", { description: message });

        localStorage.setItem("user_info", JSON.stringify(data.user));

        queryClient.invalidateQueries({ queryKey: ["auth-user"] });

        navigate("/dashboard");
      }
      else if (data.otpId && data.token) {

        toast.success("OTP Sent!", { description: message });

        sessionStorage.setItem("otp_phone_number", data?.phoneNumber);

        navigate("/otp-verification");
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error("Authentication Error", { description: message });
    },
  });