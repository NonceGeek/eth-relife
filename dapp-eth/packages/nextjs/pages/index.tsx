import { useEffect, useState } from "react";
import { NextPage } from "next";
import ReactMarkdown from "react-markdown";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const ETHSpace: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [isAccountInitialized, setIsAccountInitialized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [theLife, setTheLife] = useState(null);
  const [bodhiScriptId, setBodhiScriptId] = useState("15486"); // Default value set to current script ID

  const { data: yourContract } = useScaffoldContract({
    contractName: "relife", // Replace with your actual contract name
  });

  const { writeAsync: initAccount } = useScaffoldContractWrite({
    contractName: "relife",
    functionName: "initAccount",
  });

  const { writeAsync: generateLife, isSuccess: isGenerateLifeSuccess } = useScaffoldContractWrite({
    contractName: "relife",
    functionName: "generateLife",
  });

  const { data: accountData, refetch: refetchAccount } = useScaffoldContractRead({
    contractName: "relife",
    functionName: "getAccount",
    args: [address],
  });

  const { data: latestLife, refetch: getLatestLife } = useScaffoldContractRead({
    contractName: "relife",
    functionName: "getLatestLife",
    args: [address],
  });

  const handleGetLatestLife = async () => {
    try {
      const { data: updatedLife } = await getLatestLife();
      console.log("latestLife", updatedLife);
      
      // Create an array to store formatted events
      const formattedEvents = [];
      
      // Process events sequentially until #DEAD is encountered
      for (let index = 0; index < updatedLife.lifeEvents.length; index++) {
        const event = updatedLife.lifeEvents[index];
        const uniqueId = index + 1;
        const eventNum = (parseInt(event.toString(), 16) % 10) + 1;
        
        try {
          let eventText = await fetchEvent(uniqueId, eventNum);
          // If event contains #DEAD, stop processing further events
          if (eventText.includes("#DEAD")) {
            eventText = eventText.replaceAll("#DEAD", "");
            formattedEvents.push(`${index + 1}. ${eventText}`);
            break;
          }
          formattedEvents.push(`${index + 1}. ${eventText}`);
        } catch (error) {
          console.error(`Error fetching event ${index + 1}:`, error);
          formattedEvents.push(`${index + 1}. Failed to fetch event`);
        }
      }
      
      // Format the life data into a readable string
      const formattedLife = `
你出生了，你的人生剧本基于：[https://bodhi.wtf/space/5/${bodhiScriptId}](https://bodhi.wtf/space/5/${bodhiScriptId})
You were born, your life script is based on: [https://bodhi.wtf/space/5/${bodhiScriptId}](https://bodhi.wtf/space/5/${bodhiScriptId})

你出生的坐标点是：(${updatedLife.position.x}, ${updatedLife.position.y}, ${updatedLife.position.z})
You borned at the position: (${updatedLife.position.x}, ${updatedLife.position.y}, ${updatedLife.position.z})

你经历的人生事件是 / Your life events:
${formattedEvents.join('\n')}

以上就是你生成的链上人生🚬。
This is your generated on-chain life🚬.
`.trim();

      setTheLife(formattedLife);
    } catch (error) {
      console.error("Error fetching latest life:", error);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkAccount = async () => {
    console.log("checkAccount");
    try {
      await refetchAccount();

      if (accountData) {
        setIsAccountInitialized(true);
        return true;
      }
      setIsAccountInitialized(false);
      return false;
    } catch (error) {
      console.error("Error checking account:", error);
      setIsAccountInitialized(false);
      return false;
    }
  };

  const handleInitAccount = async () => {
    if (!yourContract || !address) {
      alert("Please connect your wallet and ensure the contract is loaded.");
      return;
    }

    try {
      const resp = await initAccount();
      console.log("resp", resp);
      console.log("Account initialized successfully!");
    } catch (error) {
      console.error("Error initializing account:", error);
      alert("Failed to initialize account. See console for details.");
    }
  };

  // TODO: run checkAccount when wallet is connected.
  useEffect(() => {
    if (isConnected) {
      checkAccount();
    }
  }, [checkAccount, isConnected]);

  // FONT: Larry 3D
  // TODO: make the emoji change in interval when the user hover on.

  const upper = `                                       
    ____            ___           ___         
    /\\  _\`\\         /\\_ \\    __  /'___\\        
    \\ \\ \\😎\\ \\     __\\//\\ \\  /\\_\\/\\ \\__/   __   
     \\ \\ ,  /   /'__\`\\\\ \\ \\ \\/\\ \\ \\ ,__\\'__\`\\ 
      \\ \\ \\\\ \\ /\\  __/ \\_\\ \\_\\ \\ \\ \\ \\_/\\  __/ 
       \\ \\_\\ \\_\\ \\____\\/\\____\\\\ \\_\\ \\_\\\\ \\____\\
        \\/_/\\/ /\\/____/\\/____/ \\/_/\\/_/ \\/____/
                                                                        
`;
  const codeStyle = {
    lineHeight: "1.2", // Adjust the line height to reduce spacing
    padding: "10px", // Adjust padding as needed
    margin: "0", // Remove default margins
  };

  const fetchEvent = async (uniqueId: number, eventNum: number) => {
    const response = await fetch(`https://ao-relife.deno.dev/event?unique_id=${uniqueId}&event_num=${eventNum}`);
    const data = await response.json();
    const parsedContent = JSON.parse(`"${data.event}"`);
    return parsedContent;
  };

  const fetchRandomEvent = async () => {
    try {
      const uniqueId = Math.floor(Math.random() * 10) + 1;
      const eventNum = Math.floor(Math.random() * 10) + 1;

      const response = await fetch(`https://ao-relife.deno.dev/event?unique_id=${uniqueId}&event_num=${eventNum}`);

      if (!response.ok) {
        throw new Error("Failed to fetch random event");
      }

      const data = await response.json();
      const parsedContent = JSON.parse(`"${data.event.replaceAll("#DEAD", "")}"`);
      const contentWithUrl = `${parsedContent}\n\nsee the [script](https://bodhi.wtf/space/5/15486)`;
      console.log("Parsed content:", parsedContent);
      // TODO: Append an ai generated pic for the event in the future.
      setModalContent(contentWithUrl);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching random event:", error);
      setModalContent("Failed to get random event. Please try again.");
      setIsModalOpen(true);
    }
  };

  return (
    <div className="grid lg:grid-cols-1 flex-grow p-4">
      <div className="hero min-h-screen bg-base-200 bg-gradient-to-r from-green-500 to-blue-500 flex flex-col items-center justify-center space-y-6">
        <div className="text-content text-center">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                return (
                  <code style={codeStyle} {...props}>
                    {children}
                  </code>
                );
              },
              pre({ node, className, children, ...props }) {
                return (
                  <pre style={codeStyle} {...props}>
                    {children}
                  </pre>
                );
              },
            }}
          >
            {upper}
          </ReactMarkdown>
          <p className="py-6">
            An EVM-based Life Restart Simulator! Idle game ฅ^•ﻌ•^ฅ。
            <br />
            基于 EVM 实现人生重开模拟器！放置类小游戏 ฅ^•ﻌ•^ฅ。
          </p>
          <button
            onClick={fetchRandomEvent}
            className="p-2 rounded bg-purple-500 hover:bg-purple-600 text-white ml-4 mt-4"
          >
            Good luck! Generate a random life event 🤔
          </button>&nbsp;&nbsp;&nbsp;&nbsp;
          <button
            onClick={() => window.open("https://bodhi.wtf/space/5/15283?action=reply", "_blank")}
            className="p-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white ml-4 mt-4"
          >
            I want to create script! 📝
          </button>
          <br></br>
          <br></br>
          {!isAccountInitialized ? (
            <button
              onClick={handleInitAccount}
              className="p-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white mb-4"
            >
              InitAccount Firstly
            </button>
          ) : (
            // Game Board appears when account is initialized
            <div className="game-board bg-white p-6 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Game Board</h2>
              <button onClick={generateLife} className="p-2 rounded bg-green-500 hover:bg-green-600 text-white">
                Generate Life 🎲
              </button>
              <br></br><br></br>
              {/* Bodhi Script ID input */}
                <label htmlFor="bodhiId" className="text-gray-700">Script ID on Bodhi:</label>
                <input
                  id="bodhiId"
                  type="text"
                  value={bodhiScriptId}
                  onChange={(e) => setBodhiScriptId(e.target.value)}
                  className="border rounded px-2 py-1 w-32"
                  placeholder="Enter Script ID"
                />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button
                onClick={handleGetLatestLife}
                disabled={!isGenerateLifeSuccess}
                className={`px-4 py-2 text-white rounded transition-colors ${
                  isGenerateLifeSuccess
                    ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Check My Life!
              </button>
              <br></br>
              <br></br>
              <ReactMarkdown 
                className="text-gray-800 whitespace-pre-line"
                components={{
                  a: ({ node, children, ...props }) => (
                    <a {...props} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {theLife}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <br></br>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="mb-4">
              <ReactMarkdown
                className="text-gray-800 whitespace-pre-line"
                components={{
                  a: ({ node, children, ...props }) => (
                    <a {...props} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {modalContent}
              </ReactMarkdown>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ETHSpace;
