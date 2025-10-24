import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Container,
  Heading,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Text,
  Spinner,
  Center,
  extendTheme,
  Icon,
  Badge
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { FaTrophy, FaRocket } from 'react-icons/fa';
import axios from 'axios';
import AchievementCard from './components/AchievementCard';
import AddAchievement from './components/AddAchievement';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6F2FF',
      100: '#BAE3FF',
      200: '#7CC4FA',
      300: '#47A3F3',
      400: '#2186EB',
      500: '#0967D2',
      600: '#0552B5',
      700: '#03449E',
      800: '#01337D',
      900: '#002159'
    }
  },
  fonts: {
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800'
      }
    }
  }
});

const ParticleBackground = () => {
  useEffect(() => {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        ctx.fillStyle = `rgba(9, 103, 210, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // 绘制连线
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.strokeStyle = `rgba(9, 103, 210, ${0.15 * (1 - distance / 120)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <canvas
      id="particle-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

const App = () => {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/achievements');
      setAchievements(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('获取成就列表失败:', error);
      setAchievements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchAchievements();
    onClose();
  };

  return (
    <ChakraProvider theme={theme}>
      <Box 
        minH="100vh" 
        bg="gray.50"
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: 'linear(to-br, blue.50, purple.50, cyan.50)',
          opacity: 0.4,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <ParticleBackground />
        <Box 
          bg="rgba(255, 255, 255, 0.95)" 
          backdropFilter="blur(10px)"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)" 
          position="sticky" 
          top={0} 
          zIndex={10}
          borderBottom="1px solid"
          borderBottomColor="blue.100"
        >
          <Container maxW="container.xl" py={5}>
            <Flex justify="space-between" align="center">
              <HStack spacing={4}>
                <Flex 
                  align="center" 
                  justify="center"
                  w="48px"
                  h="48px"
                  bgGradient="linear(to-br, blue.400, blue.600)"
                  borderRadius="xl"
                  boxShadow="0 4px 12px rgba(9, 103, 210, 0.3)"
                >
                  <Icon as={FaTrophy} color="white" boxSize={6} />
                </Flex>
                <VStack align="flex-start" spacing={0}>
                  <Heading 
                    size="lg" 
                    bgGradient="linear(to-r, brand.500, brand.600)"
                    bgClip="text"
                    fontWeight="800"
                    letterSpacing="-0.5px"
                  >
                    1024 程序员成就墙
                  </Heading>
                  <Text 
                    fontSize="xs" 
                    color="gray.500" 
                    fontWeight="500"
                    display={{ base: 'none', md: 'block' }}
                  >
                    记录你的编程里程碑，见证成长的每一步
                  </Text>
                </VStack>
              </HStack>
              <Button
                leftIcon={<AddIcon />}
                bgGradient="linear(to-r, brand.500, brand.600)"
                color="white"
                onClick={onOpen}
                size={{ base: 'sm', md: 'md' }}
                borderRadius="xl"
                fontWeight="600"
                px={6}
                _hover={{ 
                  bgGradient: 'linear(to-r, brand.600, brand.700)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(9, 103, 210, 0.3)'
                }}
                _active={{
                  transform: 'translateY(0)',
                  boxShadow: '0 4px 8px rgba(9, 103, 210, 0.2)'
                }}
                transition="all 0.2s"
                boxShadow="0 4px 12px rgba(9, 103, 210, 0.25)"
              >
                发布成就
              </Button>
            </Flex>
          </Container>
        </Box>

        <Container maxW="container.xl" py={10} position="relative" zIndex={1}>
          <VStack spacing={8} align="stretch">
            {isLoading ? (
              <Center py={20}>
                <VStack spacing={5}>
                  <Box position="relative">
                    <Spinner 
                      size="xl" 
                      color="brand.500" 
                      thickness="4px" 
                      speed="0.65s"
                    />
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                    >
                      <Icon as={FaRocket} color="brand.400" boxSize={6} />
                    </Box>
                  </Box>
                  <Text color="gray.600" fontWeight="500" fontSize="lg">
                    正在加载成就墙...
                  </Text>
                </VStack>
              </Center>
            ) : achievements.length === 0 ? (
              <Center py={20}>
                <VStack spacing={6}>
                  <Box
                    w="120px"
                    h="120px"
                    borderRadius="full"
                    bgGradient="linear(to-br, blue.50, blue.100)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 8px 20px rgba(9, 103, 210, 0.15)"
                  >
                    <Icon as={FaTrophy} boxSize={16} color="brand.400" />
                  </Box>
                  <VStack spacing={3}>
                    <Text 
                      fontSize="2xl" 
                      color="gray.700"
                      fontWeight="700"
                    >
                      还没有成就记录
                    </Text>
                    <Text fontSize="md" color="gray.500" textAlign="center" maxW="400px">
                      每个伟大的程序员都从第一行代码开始<br />
                      点击右上角按钮，分享你的第一个里程碑吧！
                    </Text>
                  </VStack>
                  <Button
                    leftIcon={<AddIcon />}
                    bgGradient="linear(to-r, brand.500, brand.600)"
                    color="white"
                    onClick={onOpen}
                    size="lg"
                    borderRadius="xl"
                    fontWeight="600"
                    px={8}
                    mt={4}
                    _hover={{ 
                      bgGradient: 'linear(to-r, brand.600, brand.700)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(9, 103, 210, 0.3)'
                    }}
                    transition="all 0.2s"
                    boxShadow="0 4px 12px rgba(9, 103, 210, 0.25)"
                  >
                    发布第一个成就
                  </Button>
                </VStack>
              </Center>
            ) : (
              <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center" px={2}>
                  <HStack spacing={3}>
                    <Text fontSize="xl" fontWeight="700" color="gray.700">
                      成就列表
                    </Text>
                    <Badge 
                      colorScheme="orange" 
                      fontSize="md"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontWeight="600"
                    >
                      {achievements.length}
                    </Badge>
                  </HStack>
                </Flex>
                
                <SimpleGrid 
                  columns={{ base: 1, md: 2, lg: 3 }} 
                  spacing={8}
                  px={2}
                >
                  {achievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      onUpdate={fetchAchievements}
                    />
                  ))}
                </SimpleGrid>
              </VStack>
            )}
          </VStack>
        </Container>

        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
          <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
          <ModalContent 
            borderRadius="2xl" 
            boxShadow="2xl"
            mx={4}
          >
            <ModalHeader 
              bgGradient="linear(to-r, brand.500, brand.600)"
              bgClip="text"
              fontWeight="700"
              fontSize="2xl"
              pt={6}
            >
              🚀 发布新成就
            </ModalHeader>
            <ModalCloseButton 
              top={5} 
              right={5}
              _hover={{ bg: 'gray.100' }}
              borderRadius="full"
            />
            <ModalBody pb={6} pt={2}>
              <AddAchievement onSuccess={handleSuccess} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </ChakraProvider>
  );
};

export default App;