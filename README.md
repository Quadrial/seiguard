# SeiGuard AI - AI-Enhanced Blockchain Explorer

An AI-powered blockchain explorer specifically designed for the Sei Network, providing advanced security monitoring, intelligent analysis, and real-time threat detection.

## 🚀 Features

### 🤖 AI-Powered Analysis
- **Wallet Behavior Analysis**: Google Gemini AI analyzes wallet activity patterns and provides intelligent insights
- **Transaction Risk Assessment**: Automated risk scoring and suspicious activity detection
- **Smart Contract Analysis**: AI-generated summaries of contract functionality and security considerations

### 🛡️ Security & Monitoring
- **Real-time Transaction Monitoring**: Live monitoring of Sei Network transactions
- **Suspicious Activity Detection**: Rule-based heuristics and AI models detect potential threats
- **Smart Contract Deployment Tracking**: Monitor new contract deployments with risk assessment
- **Threat Intelligence**: Advanced pattern recognition for security threats

### 📊 Blockchain Explorer
- **Live Network Data**: Real-time blocks, transactions, and network statistics
- **Search Functionality**: Search by address, transaction hash, or block number
- **AI-Enhanced Insights**: Intelligent analysis of blockchain activity

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI Integration**: Google Gemini AI for intelligent analysis
- **Blockchain**: Sei Network RPC/REST APIs via CosmJS
- **Security**: Custom rule-based heuristics for threat detection
- **Deployment**: Vite for development and build

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key (optional - default key provided)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd seiguard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup** (Optional)
   Create a `.env` file in the root directory for custom API keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SEI_RPC_ENDPOINT=https://sei-rpc.publicnode.com
   VITE_SEI_REST_ENDPOINT=https://sei-rest.publicnode.com
   ```
   
   Note: A default Gemini API key is already configured in the code.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Pages & Features

### 🏠 Home Page
- Project overview and feature showcase
- Quick navigation to all sections
- Statistics and performance metrics

### 🔍 Explorer Page
- Real-time blockchain data from Sei Network
- Live block and transaction monitoring
- AI-powered search functionality
- Network statistics and metrics

### 🧠 Wallet Analysis
- AI-powered wallet behavior analysis
- Risk scoring and assessment
- Suspicious activity detection
- Transaction pattern analysis

### 🛡️ Threat Detection
- Advanced suspicious activity detection
- Rule-based heuristics for security threats
- AI analysis of transaction patterns
- Real-time threat alerts

### 📄 Smart Contracts
- New contract deployment tracking
- AI analysis of contract functionality
- Risk assessment and verification status
- Contract interaction monitoring

## 🔧 Configuration

### Google Gemini AI Setup
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey) (optional)
2. Add it to your `.env` file as `VITE_GEMINI_API_KEY`
3. The AI features will automatically activate with the default key

### Sei Network Configuration
- Default RPC endpoint: `https://sei-rpc.publicnode.com`
- Default REST endpoint: `https://sei-rest.publicnode.com`
- Can be customized in the `.env` file

## 🏗️ Architecture

### Services
- **BlockchainService**: Handles Sei Network API interactions
- **AIService**: Manages OpenAI integration for intelligent analysis
- **SuspiciousActivityService**: Implements threat detection algorithms

### Components
- **Home**: Landing page with feature showcase
- **Explorer**: Main blockchain explorer interface
- **WalletView**: AI-powered wallet analysis
- **Suspicious**: Threat detection and security monitoring
- **NewContracts**: Smart contract deployment tracking

## 🔒 Security Features

### Detection Rules
1. **High Gas Usage**: Detects unusually high gas consumption
2. **Contract Interactions**: Identifies suspicious smart contract calls
3. **Large Transfers**: Flags unusually large value transfers
4. **Unknown Contracts**: Detects interactions with unverified contracts
5. **Unusual Frequency**: Identifies abnormal transaction patterns

### AI Analysis
- Natural language summaries of wallet activity
- Risk level assessment (Low/Medium/High)
- Intelligent pattern recognition
- Automated threat detection

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy
The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is built for the Sei AI/Accelathon Hackathon.

## 🙏 Acknowledgments

- Sei Network for providing the blockchain infrastructure
- Google Gemini AI for intelligent analysis
- CosmJS for blockchain interaction libraries
- React and Tailwind CSS communities

---

**Built with ❤️ for the Sei AI/Accelathon Hackathon**
