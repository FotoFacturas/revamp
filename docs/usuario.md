# Usuario

### /Api/MobileV1/GetUserData

Regresa todos los datos de la cuenta del usuario que venga en el JWT.

Datos:

* FFUsers
* FFUserTaxInfos
* FFUserTaxInfoPaymentData
* FFUserTaxInfoEntities
* RegimenFiscal
* Association
* AssociationPlan
* FFUserDevices
* DevicePlatform


### /Api/MobileV1/AddUser

Registra un nuevo usuario.

Valida la longitud del telefono y codigo telefonico, asi como que no exista otro correo o numero de telefono registrado ya en la plataforma.


### /Api/MobileV1/UpdateUser

Se actualizan los datos base del usario. Tabla `FFUsers`, si se actualiza el telefono o correo, se marcan como no verificados.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/AddUserDevice

Registra un dispositivo en la plataforma, su token de firebase, modelo y tipo de dispositivo; asi como su dirección IP.

Si el registro del token ya existe, se actualiza el modelo y la dirección IP.

Valida que el tipo de plataforma exista.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/AddUserTaxInfoAutomated

Recibe un archivo PDF, lo procesa con el msv de `VisionAPI` para extraer los datos del CSF. Se guarda en base de datos la `FFUserTaxInfos` y `FFUserTaxInfoEntities`; se sube el PDF a S3.

Valida que no exista otro RFC vinculado a ese cliente ya en la base de datos y que se envie el archivo.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/AddUserTaxInfo

Se guarda de forma manual los datos de la `FFUserTaxInfos` y `FFUserTaxInfoEntities`.

Valida que no exista otro RFC vinculado a ese cliente ya en la base de datos.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/UpdateUserTaxInfo

Actualiza los datos de `FFUserTaxInfos`.

Valida que no exista otro RFC vinculado a ese cliente ya en la base de datos, que el registro le pertenezca y valida que sea un registro `IsVerified= false`.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/ChangeStatusUserTaxInfo

Archiva o desarchiva un `FFUserTaxInfos`. Cambiando el valor `isActive`, esto sigue trayendo el registro en `GetUserData`, pero con el valor `isActive = false`.

Valida que el registro le pertenezca al usuario.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/VerifyUserTaxInfo

Recibe un archivo PDF y un ffUserTaxInfoId, lo procesa con el msv de `VisionAPI` para extraer los datos del CSF. Se actualiza en base de datos la `FFUserTaxInfos` y `FFUserTaxInfoEntities`; se sube el PDF a S3 y se elimina anterior PDF de S3 si existe.

Valida que no exista otro RFC vinculado a ese cliente ya en la base de datos, que el registro le pertenezca, que se mande el archivo y el id.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/AddUserTaxInfoCard

Guarda la tarjeta y su tipo en base de datos, si la tarjeta ya existe, se actualiza el tipo que se mande. Esta tarjeta esta vinculada a  `FFUserTaxInfos`.

Valida que la tarjeta sea de 4 digitos y que tipo de pago exista.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/DeleteUserTaxInfoCard

Elimina el registro de la tarjeta de `FFUserTaxInfos`.

Valida que la tarjeta exista y le pertenezca al cliente.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/AddUserTaxEntity

Añade un regimen a una `FFUserTaxInfos`.

Valida que el `FFUserTaxInfos` exista, le pertenezca al usuario, valida que sea un registro `IsVerified= false` y que no se encuentre el mismo regimen ya vinculado.

Esta acción es guardada en el registro del usuario.


### /Api/MobileV1/DeleteUserTaxEntity

Elimna un regimen a una `FFUserTaxInfos`.

Valida que el `FFUserTaxInfos` exista, le pertenezca al usuario y valida que sea un registro `IsVerified= false`.

Esta acción es guardada en el registro del usuario.


\