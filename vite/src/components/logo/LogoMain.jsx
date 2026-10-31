import myLogo from '../../assets/images/users/my-Logo.jpg';

export default function LogoMain() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        marginLeft: '70px' // 🟢 រញែកទៅស្តាំឱ្យចំ center នៃ Sidebar ដូចក្នុងរូបភាព
      }}
    >
      <img
        src={myLogo}
        alt="Logo"
        style={{
          height: '70px',       // ទំហំកម្ពស់ស្អាតល្មម
          width: 'auto',
          objectFit: 'contain',
          borderRadius: '8px'
        }}
      />
    </div>
  );
}
