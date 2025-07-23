import * as HTTP from './http';

exports.getTickets = async (token, ticketsFilter) => {
  let endpoint = `/api/tickets/filtered`;

  let urlParams = `?token=${token}&filter=${ticketsFilter}`;

  let urlString = `${endpoint}${urlParams}`;
  //console.log({ urlString });

  let data = HTTP.GET(`${urlString}`);

  return data;
};

exports.getTicket = async ({ticketID, token}) => {
  let endpoint = `/api/tickets/${ticketID}`;

  let urlParams = `?token=${token}`;

  let data = HTTP.GET(`${endpoint}${urlParams}`);

  return data;
};

exports.createTicket = async ({token, scanURL}) => {
  let endpoint = `/api/tickets`;

  const postData = {};
  postData['token'] = token;
  postData['scanURL'] = scanURL;

  let data = HTTP.POST(endpoint, postData);

  return data;
};

exports.validateAndroidReceipt = async receipt => {
  let endpoint = '/api/app/validate_android_receipt';

  const postData = {};
  postData['data'] = receipt;

  let data = HTTP.POST(endpoint, postData);

  return data;
};

exports.deleteTicket = async ({token, ticketID}) => {
  let endpoint = `/api/tickets/${ticketID}`;

  const postData = {};
  postData['token'] = token;

  let data = HTTP.DELETE(endpoint, postData);

  return data;
};

exports.updateTicket = async ({token, ticketID, updateJSON}) => {
  let endpoint = `/api/tickets/${ticketID}?token=${token}`;

  let data = HTTP.PUT(endpoint, updateJSON);

  return data;
};

exports.forwardEmail = async ({token, ticketID, forward_email_address}) => {
  let endpoint = `/api/services/forward_invoice_email`;

  let urlParams = `?token=${token}&ticketID=${ticketID}&forward_email_address=${forward_email_address}`;

  let data = HTTP.GET(`${endpoint}${urlParams}`);

  return data;
};

// TODO: Tokenize this endpoint for security
exports.getPresignedUploadURLS = async () => {
  let endpoint = `/api/services/generate_upload_url?type=ticket`;

  let data = HTTP.GET(endpoint);

  return data;
};

exports.getPresignedUploadURL4CSF = async token => {
  let endpoint = `/api/services/generate_upload_url?type=csf&token=${token}`;

  let data = HTTP.GET(endpoint);

  return data;
};

exports.generateURLForInvoiceZIP = async ({token, ticketID}) => {
  let endpoint = `/api/services/generate_zip_file/${ticketID}`;

  let urlParams = `?token=${token}`;

  let url = HTTP.URL_FOR(`${endpoint}${urlParams}`);

  return url;
};

exports.authEmail = async email => {
  let endpoint = `/api/auth/email`;

  const postData = {};
  postData['email'] = email;

  let data = HTTP.POST(endpoint, postData);

  // returns a {message: 'otp sent'} if valid
  return data;
};

exports.authCellphone = async cellphone => {
  let endpoint = `/api/auth/existing_cellphone`;

  const postData = {};
  postData['cellphone'] = cellphone;

  let data = HTTP.POST(endpoint, postData);

  // returns a {message: 'otp sent'} if valid
  return data;
};

exports.authMergeCellphoneIntent = async (cellphone, token) => {
  let endpoint = `/api/auth/merge_cellphone_intent`;

  const postData = {};
  postData['cellphone'] = cellphone;
  postData['token'] = token;

  let data = HTTP.POST(endpoint, postData);

  // returns a {message: 'otp sent'} if valid
  return data;
};

exports.authMergeCellphoneVerify = async (cellphone, otp, token) => {
  let endpoint = `/api/auth/merge_cellphone_verify`;
  const postData = {};
  postData['cellphone'] = cellphone;
  postData['otp'] = otp;
  postData['token'] = token;
  let data = HTTP.POST(endpoint, postData);
  return data;
};

exports.authVerifyCellphoneOTP = async (cellphone, otp) => {
  let endpoint = `/api/auth/verify_cellphone_otp`;

  const postData = {};
  postData['cellphone'] = cellphone;
  postData['otp'] = otp;

  let data = HTTP.POST(endpoint, postData);

  // returns a {...user} if valid
  return data;
};

exports.authVerifyEmailOTP = async (email, otp) => {
  let endpoint = `/api/auth/verify_email_otp`;

  const postData = {};
  postData['email'] = email;
  postData['otp'] = otp;

  let data = HTTP.POST(endpoint, postData);

  // returns a {...user} if valid
  return data;
};

exports.updateDevicePushToken = async (token, devicePushToken) => {
  let endpoint = `/api/accounts/users/devicePushNotification`;

  const postData = {};
  postData['token'] = token;
  postData['devicePushToken'] = devicePushToken;

  let data = HTTP.POST(endpoint, postData);

  return data;
};

exports.checkUpdatesForAppVersion = async (currentVersion, platform) => {
  let endpoint = `/api/app/update`;

  let urlParams = `?version=${currentVersion}&platform=${platform}`;

  let data = HTTP.TIMEDGET(`${endpoint}${urlParams}`, 1500);

  return data;
};

exports.accountsUsersUpdate = async (token, userID, updateJSON) => {
  let endpoint = `/api/accounts/users/${userID}?token=${token}`;

  const putData = updateJSON;

  let data = HTTP.PUT(endpoint, putData);

  return data;
};

exports.accountsUserInfo = async (
  token,
  platform,
  purchase_data,
  app_version,
) => {
  let endpoint = `/api/accounts/users/me`;

  let urlParams = `?token=${token}&platform=${platform}&purchase_data=${purchase_data}&app_version=${app_version}`;

  let data = HTTP.GET(`${endpoint}${urlParams}`);

  return data;
};

exports.accountsUserInfoReadOnly = async token => {
  let endpoint = `/api/accounts/users/me`;
  let urlParams = `?token=${token}&mode=readonly`;

  let data = HTTP.GET(`${endpoint}${urlParams}`);

  return data;
};

exports.users_delete_me = async ({token}) => {
  let endpoint = `/api/accounts/users/delete/me`;

  let urlParams = `?token=${token}`;

  let data = HTTP.POST(`${endpoint}${urlParams}`);

  return data;
};

exports.getMonthlyTicketCount = async (token, startDate, endDate) => {
  let endpoint = `/api/tickets/count`;

  const postData = {};
  postData['token'] = token;
  postData['start_date'] = startDate;
  postData['end_date'] = endDate;

  try {
    let data = await HTTP.POST(endpoint, postData);
    // Add success flag to the response
    return { ...data, success: true };
  } catch (error) {
    console.error('Error fetching monthly ticket count:', error);
    // Return failure so app can fall back to UI count
    return { count: 0, success: false };
  }
};

// Updated to use existing_cellphone endpoint
exports.sendPhoneVerification = async (phoneNumber, options = {}) => {
  // Use existing_cellphone endpoint from your routes
  return exports.authCellphone(phoneNumber);
};

exports.verifyPhoneCode = async (phoneNumber, code) => {
  // Format phone exactly like the backend expects
  const formattedPhone = phoneNumber.replace(/\s/g, "").replace("*", "");
  
  // The server expects phone to be in the exact format it was stored
  // Don't modify the +52 prefix - the backend handles this
  return exports.authVerifyCellphoneOTP(formattedPhone, code);
};