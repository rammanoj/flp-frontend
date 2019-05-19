const BASE_API_URI = "http://52.14.193.169/";

// method: POST
export const signup = BASE_API_URI + "accounts/signup/";
// method: POST
export const login = BASE_API_URI + "accounts/login/";
// method: POST
export const forgotPassword = BASE_API_URI + "accounts/forgot_password/";
// method: GET, PATCH
export const profile = BASE_API_URI + "accounts/update/";
// method: PATCH
export const passwordUpdate = BASE_API_URI + "accounts/password_update/";
// method: POST
export const logout = BASE_API_URI + "accounts/logout/";
//method: GET, PATCH, DELETE
export const GroupListView = BASE_API_URI + "team/";
//method: POST
export const GroupCreateView = BASE_API_URI + "team/create/";
// method: POST
export const TeamAddRemoveUser = BASE_API_URI + "team/user/edit/";
//method: POST
export const TeamInviteUser = BASE_API_URI + "team/invite/";
//method: GET
export const checkInviteLink = BASE_API_URI + "team/invite?link=";
//method: POST
export const TeamUserList = BASE_API_URI + "team/users/";
// method: DELETE
export const TeamDeleteUser = BASE_API_URI + "user/team/delete/";
// method: POST
export const PostCreateView = BASE_API_URI + "post/create/";
// method:  GET
export const PostListView = BASE_API_URI + "posts/";
// method: POST, PATCH, DELETE
export const PostView = BASE_API_URI + "post/";
// method: PSOT
export const postAction = BASE_API_URI + "post/action/";
// method: POST
export const commentCreate = BASE_API_URI + "post/comment/add/";
// method: PATCH, DELETE
export const commentApi = BASE_API_URI + "post/comment/";
// method: GET
export const commentList = BASE_API_URI + "post/comments/";
// method: POST
export const replyCreate = BASE_API_URI + "recomment/";
// method: PATCH
export const replyUpdate = BASE_API_URI + "recomment/update/";
// method: GET
export const notifyListView = BASE_API_URI + "<group_pk>/notifications/";
// method: POST
export const subGroupCreate = BASE_API_URI + "subgroup/create/";
// method: GET, PATCH, DELETE
export const subGroupUpdate = BASE_API_URI + "subgroup/";

/* Pagination Count */

export const paginationCount = 80;
export const postpaginationCount = 25;

// Accepted MiME types
export const acceptedTypes = [
  "application/pdf",
  "application/zip",
  "application/x-7z-compressed",
  "image",
  "application/gzip"
];

// month names
export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

// supported Image Formats
export const imageFormats = [
  "jpeg",
  "png",
  "jpg",
  "gif",
  "bmp",
  "webp",
  "JPEG",
  "PNG",
  "JPG",
  "GIF",
  "BMP",
  "WEBP"
];

// template colors

export const green = "#10e510";
export const blue = "";
export const red = "#ed092f";
