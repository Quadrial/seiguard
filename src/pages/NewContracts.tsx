import React, { useState, useEffect } from 'react';
import {
  FaCode,
  FaBrain,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

interface Contract {
  address: string;
  name: string;
  deployer: string;
  timestamp: string;
  verified: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  aiSummary: string;
}

const NewContracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const mockContracts: Contract[] = [
        {
          address: 'sei1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
          name: 'DeFi Protocol Alpha',
          deployer: 'sei1deployer123456789abcdefghijklmnopqrstuvwxyz',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          verified: true,
          riskLevel: 'low',
          aiSummary: 'Legitimate DeFi protocol with standard security practices.'
        },
        {
          address: 'sei1xyz987wvu654tsr321pon098mlk456jih789gfe012dcb345a',
          name: 'Unknown Contract',
          deployer: 'sei1unknown456789abcdefghijklmnopqrstuvwxyz123',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          verified: false,
          riskLevel: 'high',
          aiSummary: 'Unverified contract with suspicious patterns detected.'
        }
      ];
      setContracts(mockContracts);
      setLoading(false);
    }, 2000);
  }, []);



  const formatAddress = (address: string) => {
    return `${address.substring(0, 12)}...${address.substring(address.length - 12)}`;
  };

  return (
    <div className="mt-10 px-10 text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Smart Contract Deployments</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
            <FaCode className="text-3xl text-blue-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-blue-400">2</h3>
            <p className="text-gray-400">New Contracts</p>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
            <FaCheckCircle className="text-3xl text-green-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-green-400">1</h3>
            <p className="text-gray-400">Verified</p>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
            <FaBrain className="text-3xl text-cyan-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-cyan-400">100%</h3>
            <p className="text-gray-400">AI Analyzed</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Scanning for new contracts...</p>
          </div>
        ) : (
          <div className="bg-[#111827] rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Recent Deployments</h2>
            </div>
            
            <div className="divide-y divide-gray-700">
              {contracts.map((contract, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center">
                        <FaCode className="text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{contract.name}</h3>
                        <p className="text-sm text-gray-400 font-mono">
                          {formatAddress(contract.address)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        contract.riskLevel === 'high' ? 'bg-red-900 text-red-200' :
                        contract.riskLevel === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-green-900 text-green-200'
                      }`}>
                        {contract.riskLevel.toUpperCase()}
                      </span>
                      {contract.verified ? (
                        <FaCheckCircle className="text-green-400" />
                      ) : (
                        <FaExclamationTriangle className="text-red-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-400">Deployer:</span>
                      <p className="font-mono">{formatAddress(contract.deployer)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p className={contract.verified ? 'text-green-400' : 'text-red-400'}>
                        {contract.verified ? 'Verified' : 'Unverified'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">AI Analysis:</span>
                    <p className="text-sm mt-1">{contract.aiSummary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewContracts;