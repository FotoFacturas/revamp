# Seguridad

### /Api/MobileV1/RequestLoginOtpEmail

Es usada para enviar un correo con un OTP de inicio de sesión. `OtpType.EMAIL_LOGIN`

Se valida que el usuario exista, este activo y no eliminado.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/RequestLoginOtpPhone

Es usada para enviar un SMS con un OTP de inicio de sesión. `OtpType.SMS_LOGIN`

Se valida que el usuario exista, este activo y no eliminado.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/LoginOtpEmail

Es usada para obtener el JWT de la sesión del usuario por el proceso de verificacion del `OtpType.EMAIL_LOGIN` generado con `RequestLoginOtpEmail`

Se valida que el usuario exista, este activo y no eliminado.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/LoginOtpPhone

Es usada para obtener el JWT de la sesión del usuario por el proceso de verificacion del `OtpType.SMS_LOGIN` generado con `RequestLoginOtpPhone`

Se valida que el usuario exista, este activo y no eliminado.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/KeepSession

Es usada para regenerar el JWT de la sesión del usuario si este aun mantiene una sesión valida.

Se valida que el usuario exista, este activo y no eliminado.


### /Api/MobileV1/RequestVerifyOtpEmail

Es usada para enviar un correo con un OTP para verificar el email. `OtpType.EMAIL_VERIFY`

Se valida que el usuario exista, este activo y no eliminado.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/RequestVerifyOtpPhone

Es usada para enviar un SMS con un OTP para verificar el telefono. `OtpType.SMS_VERIFY`

Se valida que el usuario exista, este activo y no eliminado.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/ValidateOtpEmail

Es usada para validar el correo del usuario por el proceso de verificacion del `OtpType.EMAIL_VERIFY` generado con `RequestVerifyOtpEmail`, esto pone `IsEmailVerified = true`

Se valida que el usuario exista, este activo y no eliminado.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/ValidateOtpPhone

Es usada para validar el numero de telefono del usuario por el proceso de verificacion del `OtpType.SMS_VERIFY` generado con `RequestVerifyOtpPhone`, esto pone `IsPhoneVerified = true`

Se valida que el usuario exista, este activo y no eliminado.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/RequestDownloadOtpEmail

Es usada para enviar un correo con un OTP para solicitar la descarga de sus datos. `OtpType.EMAIL_DOWNLOAD`

Se valida que el usuario exista, este activo y no eliminado, tambien se valida que `IsEmailVerified = true`

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/RequestDownloadOtpPhone

Es usada para enviar un SMS con un OTP para solicitar la descarga de sus datos. `OtpType.SMS_DOWNLOAD`

Se valida que el usuario exista, este activo y no eliminado, tambien se valida que `IsPhoneVerified = true`

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/ValidateDownloadOtpEmail

Es usada para solicitar la descarga de todos los datos asociados a la cuenta por el proceso de verificacion  del `OtpType.EMAIL_DOWNLOAD` generado con `RequestDownloadOtpEmail`.

Se valida que el usuario exista, este activo y no eliminado.

Esta acción es guardada en el registro del usuario.

==Falta la implementacion de la eliminación.==


### /Api/MobileV1/ValidateDownloadOtpPhone

Es usada para solicitar la descarga de todos los datos asociados a la cuenta por el proceso de verificacion del `OtpType.SMS_DOWNLOAD` generado con `RequestDownloadOtpPhone`.

Se valida que el usuario exista, este activo y no eliminado.

Esta acción es guardada en el registro del usuario.

==Falta la implementacion de la eliminación.==


### /Api/MobileV1/RequestDeleteOtpEmail

Es usada para enviar un correo con un OTP para solicitar la eliminación de sus datos.  `OtpType.EMAIL_DELETE`

Se valida que el usuario exista, este activo y no eliminado, tambien se valida que `IsEmailVerified = true`

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/RequestDeleteOtpPhone

Es usada para enviar un SMS con un OTP para solicitar la eliminación de sus datos. `OtpType.SMS_DELETE`

Se valida que el usuario exista, este activo y no eliminado, tambien se valida que `IsPhoneVerified = true`

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/ValidateDeleteOtpEmail

Es usada para eliminar la cuenta por el proceso de verificacion del `OtpType.EMAIL_DELETE` generado con `RequestDeleteOtpEmail`.

Se valida que el usuario exista, este activo y no eliminado.

Esta acción es guardada en el registro del usuario.

==Falta la implementacion de la eliminación.==


### /Api/MobileV1/ValidateDeleteOtpPhone

Es usada para eliminar la cuenta por el proceso de verificacion del `OtpType.SMS_DELETE` generado con `RequestDeleteOtpPhone`.

Se valida que el usuario exista, este activo y no eliminado.

Esta acción es guardada en el registro del usuario.

==Falta la implementacion de la eliminación.==