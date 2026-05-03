<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" Name="MyApp" Language="1033" Version="1.0.0.0" Manufacturer="YourCompany" UpgradeCode="12345678-1234-1234-1234-123456789abc">
    <Package InstallerVersion="500" Compressed="yes" InstallScope="perMachine" />
    <MajorUpgrade DowngradeErrorMessage="A newer version is already installed." />
    <MediaTemplate />
    <Feature Id="ProductFeature" Title="MyApp" Level="1">
      <ComponentGroupRef Id="ProductComponents" />
    </Feature>
  </Product>
  <Fragment>
    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFilesFolder">
        <Directory Id="INSTALLFOLDER" Name="MyApp" />
      </Directory>
    </Directory>
  </Fragment>
  <Fragment>
    <ComponentGroup Id="ProductComponents" Directory="INSTALLFOLDER">
      <Component Id="MyAppExe" Guid="87654321-4321-4321-4321-cba987654321">
        <File Source="..\bin\Release\MyApp.exe" />
      </Component>
    </ComponentGroup>
  </Fragment>
</Wix>
candle Untitled-1
light Untitled-1.wixobj


## License: MS_PL
https://github.com/nickhodge/MahTweets.LawrenceHargrave/tree/2d5e2dd2f4aafa140a7be816695651bacb0df1ae/MahTweets.Installer/Product.wxs

```
" Level="1">
      <ComponentGroupRef Id="ProductComponents" />
    </Feature>
  </Product>
  <Fragment>
    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFilesFolder">
        <Directory Id="INSTALLFOLDER"
```

