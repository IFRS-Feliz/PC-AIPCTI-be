-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 30, 2021 at 10:51 PM
-- Server version: 10.4.18-MariaDB
-- PHP Version: 8.0.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prestacaocontas_prod`
--

-- --------------------------------------------------------

--
-- Table structure for table `edital`
--

CREATE TABLE `edital` (
  `id` int(11) NOT NULL,
  `nome` varchar(300) DEFAULT NULL,
  `dataInicio` date DEFAULT NULL,
  `dataFim` date DEFAULT NULL,
  `ano` char(4) DEFAULT NULL,
  `valorAIPCTI` decimal(15,2) DEFAULT NULL,
  `dataLimitePrestacao` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `gru`
--

CREATE TABLE `gru` (
  `id` int(11) NOT NULL,
  `pathAnexoGruCusteio` varchar(500) DEFAULT NULL,
  `valorTotalCusteio` decimal(15,2) DEFAULT NULL,
  `idProjeto` int(11) NOT NULL,
  `pathAnexoComprovanteCusteio` varchar(500) DEFAULT NULL,
  `valorTotalCapital` decimal(15,2) DEFAULT NULL,
  `pathAnexoGruCapital` varchar(500) DEFAULT NULL,
  `pathAnexoComprovanteCapital` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `item`
--

CREATE TABLE `item` (
  `id` int(11) NOT NULL,
  `idProjeto` int(11) DEFAULT NULL,
  `pathAnexo` varchar(500) DEFAULT NULL,
  `descricao` varchar(300) DEFAULT NULL,
  `despesa` char(7) DEFAULT NULL,
  `tipo` varchar(30) DEFAULT NULL,
  `nomeMaterialServico` varchar(300) DEFAULT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `dataCompraContratacao` date DEFAULT NULL,
  `cnpjFavorecido` varchar(14) DEFAULT NULL,
  `numeroDocumentoFiscal` varchar(50) DEFAULT NULL,
  `frete` decimal(15,2) DEFAULT NULL,
  `quantidade` int(11) DEFAULT NULL,
  `valorUnitario` decimal(15,2) DEFAULT NULL,
  `valorTotal` decimal(15,2) DEFAULT NULL,
  `tipoDocumentoFiscal` varchar(50) DEFAULT NULL,
  `isCompradoComCpfCoordenador` tinyint(1) DEFAULT NULL,
  `isNaturezaSingular` tinyint(1) DEFAULT NULL,
  `posicao` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `justificativa`
--

CREATE TABLE `justificativa` (
  `id` int(11) NOT NULL,
  `idItem` int(11) DEFAULT NULL,
  `pathAnexo` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `orcamento`
--

CREATE TABLE `orcamento` (
  `id` int(11) NOT NULL,
  `idItem` int(11) DEFAULT NULL,
  `pathAnexo` varchar(500) DEFAULT NULL,
  `dataOrcamento` date DEFAULT NULL,
  `nomeMaterialServico` varchar(300) DEFAULT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `cnpjFavorecido` varchar(14) DEFAULT NULL,
  `frete` decimal(15,2) DEFAULT NULL,
  `quantidade` int(11) DEFAULT NULL,
  `valorUnitario` decimal(15,2) DEFAULT NULL,
  `valorTotal` decimal(15,2) DEFAULT NULL,
  `isOrcadoComCpfCoordenador` tinyint(1) DEFAULT NULL,
  `isOrcamentoCompra` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `projeto`
--

CREATE TABLE `projeto` (
  `id` int(11) NOT NULL,
  `cpfUsuario` varchar(11) DEFAULT NULL,
  `nome` varchar(300) DEFAULT NULL,
  `valorRecebidoTotal` decimal(15,2) DEFAULT NULL,
  `valorRecebidoCusteio` decimal(15,2) DEFAULT NULL,
  `valorRecebidoCapital` decimal(15,2) DEFAULT NULL,
  `idEdital` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--

CREATE TABLE `usuario` (
  `cpf` varchar(11) NOT NULL,
  `nome` varchar(250) DEFAULT NULL,
  `email` varchar(254) DEFAULT NULL,
  `senha` varchar(300) DEFAULT NULL,
  `isAdmin` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `edital`
--
ALTER TABLE `edital`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `gru`
--
ALTER TABLE `gru`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idProjeto` (`idProjeto`);

--
-- Indexes for table `item`
--
ALTER TABLE `item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idProjeto` (`idProjeto`);

--
-- Indexes for table `justificativa`
--
ALTER TABLE `justificativa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idItem` (`idItem`);

--
-- Indexes for table `orcamento`
--
ALTER TABLE `orcamento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idItem` (`idItem`);

--
-- Indexes for table `projeto`
--
ALTER TABLE `projeto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cpfUsuario` (`cpfUsuario`),
  ADD KEY `idEdital` (`idEdital`);

--
-- Indexes for table `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`cpf`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `edital`
--
ALTER TABLE `edital`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gru`
--
ALTER TABLE `gru`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `item`
--
ALTER TABLE `item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `justificativa`
--
ALTER TABLE `justificativa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orcamento`
--
ALTER TABLE `orcamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projeto`
--
ALTER TABLE `projeto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `gru`
--
ALTER TABLE `gru`
  ADD CONSTRAINT `gru_ibfk_1` FOREIGN KEY (`idProjeto`) REFERENCES `projeto` (`id`);

--
-- Constraints for table `item`
--
ALTER TABLE `item`
  ADD CONSTRAINT `item_ibfk_1` FOREIGN KEY (`idProjeto`) REFERENCES `projeto` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `justificativa`
--
ALTER TABLE `justificativa`
  ADD CONSTRAINT `justificativa_ibfk_1` FOREIGN KEY (`idItem`) REFERENCES `item` (`id`);

--
-- Constraints for table `orcamento`
--
ALTER TABLE `orcamento`
  ADD CONSTRAINT `orcamento_ibfk_1` FOREIGN KEY (`idItem`) REFERENCES `item` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projeto`
--
ALTER TABLE `projeto`
  ADD CONSTRAINT `projeto_ibfk_1` FOREIGN KEY (`cpfUsuario`) REFERENCES `usuario` (`cpf`) ON DELETE CASCADE,
  ADD CONSTRAINT `projeto_ibfk_2` FOREIGN KEY (`idEdital`) REFERENCES `edital` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
