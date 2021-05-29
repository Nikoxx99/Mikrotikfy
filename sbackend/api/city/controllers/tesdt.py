intentos = 0
empleado = ""
continuar = 1
permitido = False
while permitido == False and intentos < 4:
  user=""
  password=""
  user=input(f"Usuario: {user}")
  password=input(f"Contraseña: {password}")
  if user == "admin" and password == "MisionTic2021":
    permitido = True
  else:
    print("Credenciales incorrectas")
if permitido == True:
  eleccion=''
  empleados=''
  visitantes=''
  empleado=''
  visitante=''
  while eleccion != '0':
    print()
    print("------Menú de registro de personal-----")
    print("1. Registrar ingreso de empleado.")
    print("2. Ver empleados ingresados.")
    print("3. Registrar ingreso de visitantes.")
    print("4. Ver visitantes ingresados.")
    print("")
    print("0. Salir")
    print()
    eleccion=input("Ingresa un número válido de opción en el menú: ")
    if eleccion == '1':
      valido=True
      while valido:
        empleado=input("Ingresa el nombre del empleado (Si no deseas agregar más, oprime la tecla SALIR): ")
        if empleado == "SALIR":
          valido = False
        else:
          empleados=empleados+empleado+","
    elif eleccion == '2':
      print("Ingresa un número válido de opción del menú: ")
      print("Los empleados registrados son: ", empleados)
    elif eleccion == '3':
      valido=True
      while valido:
        visitante=input("Ingresa el nombre del empleado (Si no deseas agregar más, oprime la tecla SALIR): ")
        if empleado == "SALIR":
          valido = False
        else:
          visitantes=visitantes+visitante+","
    elif eleccion == '4':
      print("Los visitantes registrados son: ", visitantes)
    elif eleccion == '0':
      print("¡Hasta luego!")
    else:
      print("Por favor ingresa una opción válida")     
else:
    print("Has agotado la cantidad de intentos, por favor inicie de nuevo el programa")

