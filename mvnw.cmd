@echo off
setlocal

rem ─── Script mvnw.cmd — Maven Wrapper para Windows ───────────────────────
rem Executa o Maven 3.9.15 já instalado via IntelliJ IDEA Wrapper,
rem forçando o uso do Java 21.

set MVN_HOME=C:\Users\gabri\.m2\wrapper\dists\apache-maven-3.9.15-bin\4rlcemksed9vjmkvgss0jpc4po\apache-maven-3.9.15
set JAVA_HOME=C:\Program Files\Common Files\Oracle\Java\javapath\..\..\..\..\Java\jdk-21

rem Fallback: se JAVA_HOME não estiver definido, tenta a localização padrão
if not exist "%JAVA_HOME%" (
    set JAVA_HOME=C:\Program Files\Java\jdk-21.0.1
)
if not exist "%JAVA_HOME%" (
    set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21
)

set PATH=%JAVA_HOME%\bin;%MVN_HOME%\bin;%PATH%

echo Usando Maven: %MVN_HOME%
echo Usando Java: %JAVA_HOME%
echo.

call "%MVN_HOME%\bin\mvn.cmd" %*

endlocal
