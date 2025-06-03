import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// We'll implement our own QR reader with the device camera
// For now, we'll simulate QR scanning with buttons
import { QrCode, Send, MessageSquare, Bell, Car, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

// Mock data - in a real app, this would come from a database
const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'ANON-123',
    receiverId: 'USER-1',
    message: 'Hi, you\'re blocking my car at Pavilion B2. Can you move it?',
    timestamp: new Date('2025-05-28T14:30:00'),
    isRead: false
  },
  {
    id: '2',
    senderId: 'ANON-456',
    receiverId: 'USER-1',
    message: 'Your headlights are on in the KLCC parking lot.',
    timestamp: new Date('2025-05-28T15:45:00'),
    isRead: false
  }
];

export function AnonymousMessaging() {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [scannedParkId, setScannedParkId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentView, setCurrentView] = useState<'inbox' | 'compose'>('inbox');
  
  // Count unread messages
  useEffect(() => {
    setUnreadCount(messages.filter(msg => !msg.isRead).length);
  }, [messages]);
  
  const handleScan = (data: string) => {
    if (data && data.startsWith('PARKLAH-')) {
      const parkId = data.substring(8);
      setScannedParkId(parkId);
      setIsQRScannerOpen(false);
      setIsMessageDialogOpen(true);
      setCurrentView('compose');
    }
  };
  
  const cancelMessageComposition = () => {
    setCurrentView('inbox');
    setScannedParkId(null);
    setMessageText('');
  };
  
  const handleSendMessage = () => {
    if (messageText.trim() && scannedParkId) {
      // In a real app, this would be sent to a server
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: 'USER-1', // Current user
        receiverId: scannedParkId,
        message: messageText,
        timestamp: new Date(),
        isRead: false
      };
      
      setMessages([...messages, newMessage]);
      setMessageText('');
      setCurrentView('inbox');
      setScannedParkId(null);
      // Show confirmation toast or notification
    }
  };
  
  const markAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };
  
  return (
    <>
      {/* Menu Buttons - using fixed positioning container for visibility on all screens */}
      <div className={`app-button-container`}>
        <div className="flex justify-between">
          <Button 
            className="app-button app-button-left" 
            variant="default"
            onClick={() => setIsMessageDialogOpen(true)}
          >
            <MessageSquare size={16} className="mr-2" />
            <span className="text-xs">Messages</span>
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 h-5 w-5 flex items-center justify-center p-0">
                {unreadCount}
              </Badge>
            )}
          </Button>
          
          <Button 
            className="app-button app-button-right" 
            variant="secondary"
            onClick={() => setIsQRScannerOpen(true)}
          >
            <QrCode size={16} className="mr-2" />
            <span className="text-xs">Scan QR</span>
          </Button>
        </div>
      </div>
      
      {/* QR Scanner Dialog - Fullscreen on Mobile */}
      <Dialog open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
        <DialogContent className="max-w-full h-[100vh] sm:min-h-fit p-0 sm:p-6 flex flex-col">
          <DialogHeader className="p-4 border-b bg-white z-10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Scan ParkLah QR Code</DialogTitle>
                <DialogDescription>
                  Scan the QR code on another driver's car to send them an anonymous message.
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon">
                  <X size={18} />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          
          <div className="p-4 flex flex-col flex-1 overflow-y-auto">
            {/* Simulated QR scanning - in a real app, we would integrate a camera-based QR reader */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center flex-1 flex flex-col justify-center">
              <QrCode size={64} className="mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-500 mb-4">Camera access would be requested here</p>
              
              {/* For demo purposes, simulate scanning different QR codes */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleScan('PARKLAH-12345')}
                >
                  Simulate Scan: Car #12345
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleScan('PARKLAH-67890')}
                >
                  Simulate Scan: Car #67890
                </Button>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-center text-gray-500 p-4 border-t mt-auto">
            QR codes can be found on the ParkLah sticker in the car window
          </p>
        </DialogContent>
      </Dialog>
      
      {/* Message Dialog - Fullscreen on Mobile */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-full h-[100vh] sm:min-h-fit p-0 sm:p-6 flex flex-col">
          <DialogHeader className="p-4 border-b bg-white z-10">
            <div className="flex items-center justify-between">
              <DialogTitle>
                {currentView === 'compose' ? `Message to Driver #${scannedParkId}` : 'Your Messages'}
              </DialogTitle>
              {currentView === 'compose' ? (
                <Button variant="ghost" size="icon" onClick={cancelMessageComposition}>
                  <X size={18} />
                </Button>
              ) : (
                <DialogClose asChild>
                  <Button variant="ghost" size="icon">
                    <X size={18} />
                  </Button>
                </DialogClose>
              )}
            </div>
          </DialogHeader>
          
          {currentView === 'compose' ? (
            // New message form
            <div className="space-y-4 p-4 flex flex-col flex-1 overflow-y-auto">
              <Textarea
                placeholder="Type your message here..."
                className="flex-1 min-h-[200px]"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                This message will be sent anonymously. The driver will not see your personal information.
              </p>
              <DialogFooter className="pt-4 mt-auto">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </DialogFooter>
            </div>
          ) : (
            // Message inbox
            <Tabs defaultValue="inbox" className="flex flex-col flex-1 overflow-hidden">
              <TabsList className="grid grid-cols-2 mb-2 sticky top-0 bg-white z-10">
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
              </TabsList>
              
              <TabsContent value="inbox" className="flex-1 overflow-y-auto p-4">
                {messages.filter(msg => msg.receiverId === 'USER-1').length > 0 ? (
                  <div className="space-y-3">
                    {messages
                      .filter(msg => msg.receiverId === 'USER-1')
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .map(message => (
                        <div 
                          key={message.id} 
                          className={`p-3 rounded-lg ${message.isRead ? 'bg-gray-100' : 'bg-blue-50 border-l-4 border-blue-500'}`}
                          onClick={() => markAsRead(message.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center">
                              <Car size={16} className="mr-1" />
                              <span className="text-sm font-medium">Anonymous Driver</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Bell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No messages in your inbox</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="sent" className="flex-1 overflow-y-auto p-4">
                {messages.filter(msg => msg.senderId === 'USER-1').length > 0 ? (
                  <div className="space-y-3">
                    {messages
                      .filter(msg => msg.senderId === 'USER-1')
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .map(message => (
                        <div key={message.id} className="p-3 rounded-lg bg-gray-100">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center">
                              <span className="text-sm font-medium">To: Driver #{message.receiverId}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Send className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No messages sent yet</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AnonymousMessaging;
